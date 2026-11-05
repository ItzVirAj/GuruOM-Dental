"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  UploadCloud,
  Search,
  Trash2,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  FileImage,
  ExternalLink,
  X,
  Copy,
  Check,
  HardDrive,
  Loader2,
} from "lucide-react";
import {
  listMediaAction,
  uploadMediaAction,
  updateMediaAltAction,
  deleteMediaAction,
  restoreMediaAction,
  getMediaUsageAction,
  type MediaItem,
  type MediaFilter,
  type ListMediaResponse,
  type MediaUsagePost,
  type StoredMediaResult,
} from "@/src/server/owner/media/actions";
import { clientResizeImage } from "@/src/lib/media/client-resize";
import cloudinaryLoader from "@/src/lib/media/cloudinary-loader";

interface MediaViewProps {
  initialData: ListMediaResponse;
}

interface UploadQueueItem {
  id: string;
  file: File;
  name: string;
  previewUrl: string;
  progress: number;
  status: "pending" | "resizing" | "uploading" | "done" | "error";
  error?: string;
  resultMedia?: MediaItem | StoredMediaResult;
}

export function MediaView({ initialData }: MediaViewProps) {
  const [data, setData] = useState<ListMediaResponse>(initialData);
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  // Selected item for drawer
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedUsage, setSelectedUsage] = useState<MediaUsagePost[]>([]);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);
  const [editingAlt, setEditingAlt] = useState("");
  const [editingDecorative, setEditingDecorative] = useState(false);
  const [isSavingAlt, setIsSavingAlt] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [deleteBlockedPosts, setDeleteBlockedPosts] = useState<MediaUsagePost[] | null>(null);

  // Upload state
  const [confirmedRights, setConfirmedRights] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("guruom_media_rights_confirmed") === "true";
    } catch {
      return false;
    }
  });
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggleRights = (val: boolean) => {
    setConfirmedRights(val);
    try {
      localStorage.setItem("guruom_media_rights_confirmed", String(val));
    } catch {}
  };

  // Refresh media list
  const refreshList = useCallback(
    (newFilter = filter, newSearch = search) => {
      startTransition(async () => {
        try {
          const res = await listMediaAction({
            filter: newFilter,
            q: newSearch,
            limit: 40,
          });
          setData(res);
        } catch (err) {
          console.error("Failed to load media list:", err);
        }
      });
    },
    [filter, search]
  );

  // Handle search & filter changes
  const handleFilterChange = (f: MediaFilter) => {
    setFilter(f);
    refreshList(f, search);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refreshList(filter, search);
  };

  // Select media for drawer
  const openDetailDrawer = async (item: MediaItem) => {
    setSelectedMedia(item);
    setEditingAlt(item.alt || "");
    setEditingDecorative(item.decorative);
    setDeleteBlockedPosts(null);
    setIsLoadingUsage(true);

    try {
      const usage = await getMediaUsageAction(item.id);
      setSelectedUsage(usage);
    } catch {
      setSelectedUsage([]);
    } finally {
      setIsLoadingUsage(false);
    }
  };

  const closeDetailDrawer = () => {
    setSelectedMedia(null);
    setSelectedUsage([]);
    setDeleteBlockedPosts(null);
  };

  // Save alt & decorative settings
  const handleSaveAlt = async () => {
    if (!selectedMedia) return;
    setIsSavingAlt(true);
    try {
      await updateMediaAltAction(selectedMedia.id, editingAlt, editingDecorative);
      setSelectedMedia((prev) =>
        prev
          ? {
              ...prev,
              alt: editingDecorative ? null : editingAlt.trim() || null,
              decorative: editingDecorative,
            }
          : null
      );
      // Update in list
      setData((prev) => ({
        ...prev,
        items: prev.items.map((it) =>
          it.id === selectedMedia.id
            ? {
                ...it,
                alt: editingDecorative ? null : editingAlt.trim() || null,
                decorative: editingDecorative,
              }
            : it
        ),
      }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save alt text");
    } finally {
      setIsSavingAlt(false);
    }
  };

  // Delete / Trash media
  const handleDeleteMedia = async () => {
    if (!selectedMedia) return;
    try {
      const res = await deleteMediaAction(selectedMedia.id);
      if (!res.success && res.blockedByPosts) {
        setDeleteBlockedPosts(res.blockedByPosts);
        return;
      }
      closeDetailDrawer();
      refreshList();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete media");
    }
  };

  // Restore media from trash
  const handleRestoreMedia = async () => {
    if (!selectedMedia) return;
    try {
      await restoreMediaAction(selectedMedia.id);
      closeDetailDrawer();
      refreshList();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to restore media");
    }
  };

  // Copy Public ID
  const handleCopyPublicId = () => {
    if (!selectedMedia) return;
    navigator.clipboard.writeText(selectedMedia.publicId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Queue upload processing
  const processFiles = useCallback(
    async (files: File[]) => {
      if (!confirmedRights) {
        alert("Please confirm you have the rights to upload these images first.");
        return;
      }

      const validFiles = files.filter((f) =>
        ["image/jpeg", "image/png", "image/webp", "image/avif"].includes(f.type)
      );

      if (validFiles.length === 0) {
        alert("Please select supported image files (JPEG, PNG, WebP, AVIF).");
        return;
      }

      const newItems: UploadQueueItem[] = validFiles.map((file) => ({
        id: Math.random().toString(36).slice(2),
        file,
        name: file.name,
        previewUrl: URL.createObjectURL(file),
        progress: 10,
        status: "pending",
      }));

      setUploadQueue((prev) => [...prev, ...newItems]);

      // Upload sequentially or parallel
      for (const item of newItems) {
        try {
          // 1. Client-side canvas resize to WebP
          setUploadQueue((prev) =>
            prev.map((q) =>
              q.id === item.id ? { ...q, status: "resizing", progress: 30 } : q
            )
          );

          const { blob } = await clientResizeImage(item.file, {
            maxWidth: 2400,
            maxHeight: 2400,
            quality: 0.85,
            onProgress: (p) => {
              setUploadQueue((prev) =>
                prev.map((q) =>
                  q.id === item.id ? { ...q, progress: 10 + Math.round(p * 35) } : q
                )
              );
            },
          });

          // 2. Upload to server upload route
          setUploadQueue((prev) =>
            prev.map((q) =>
              q.id === item.id ? { ...q, status: "uploading", progress: 60 } : q
            )
          );

          const formData = new FormData();
          formData.append("file", blob, item.file.name.replace(/\.[^/.]+$/, ".webp"));
          formData.append("confirmedRights", "true");

          const resultMedia = await uploadMediaAction(formData);

          setUploadQueue((prev) =>
            prev.map((q) =>
              q.id === item.id
                ? { ...q, status: "done", progress: 100, resultMedia }
                : q
            )
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Upload failed";
          setUploadQueue((prev) =>
            prev.map((q) =>
              q.id === item.id ? { ...q, status: "error", error: msg } : q
            )
          );
        }
      }

      // Refresh list after processing batch
      refreshList();
    },
    [confirmedRights, refreshList]
  );

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Paste handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const files: File[] = [];
      for (const item of Array.from(e.clipboardData.items)) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        processFiles(files);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [processFiles]);

  // Storage calculation
  const storageMb = (data.storageBytes / (1024 * 1024)).toFixed(1);
  const capMb = (data.storageCapBytes / (1024 * 1024)).toFixed(0);
  const storagePercent = Math.min(
    100,
    Math.round((data.storageBytes / data.storageCapBytes) * 100)
  );

  return (
    <div className="space-y-6">
      {/* 1. Header & Storage Indicator */}
      <div className="bg-white rounded-2xl border border-line p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
            Media Library
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Manage web-optimized Cloudinary dental imagery, cover photos, and clinical figures.
          </p>
        </div>

        {/* Storage Cap Bar */}
        <div className="w-full md:w-64 space-y-1.5 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-ink-muted font-medium">
              <HardDrive className="w-3.5 h-3.5 text-brand" />
              Storage Used
            </span>
            <span className="font-mono font-semibold text-ink">
              {storageMb} MB / {capMb} MB
            </span>
          </div>
          <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-line/60">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                storagePercent > 90
                  ? "bg-red-500"
                  : storagePercent > 75
                  ? "bg-amber-500"
                  : "bg-brand"
              }`}
              style={{ width: `${storagePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Drag & Drop Upload Band */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-2xl border-2 border-dashed p-6 transition-all duration-200 text-center ${
          isDragging
            ? "border-brand bg-brand/5 scale-[1.005]"
            : "border-line bg-white hover:border-brand/40"
        }`}
      >
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">
              Drag & drop images here, or paste anywhere
            </p>
            <p className="text-xs text-ink-muted mt-1">
              Auto-converts to optimized WebP. Max 4MB per file.
            </p>
          </div>

          {/* Rights Confirmation */}
          <div className="pt-2 flex items-center justify-center gap-2">
            <input
              type="checkbox"
              id="confirm-rights"
              checked={confirmedRights}
              onChange={(e) => handleToggleRights(e.target.checked)}
              className="w-4 h-4 rounded border-line text-brand focus:ring-brand accent-brand cursor-pointer"
            />
            <label
              htmlFor="confirm-rights"
              className="text-xs text-ink/80 cursor-pointer select-none"
            >
              I confirm I have rights to upload and publish these images.
            </label>
          </div>

          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!confirmedRights}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand text-white shadow-xs hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Browse Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  processFiles(Array.from(e.target.files));
                  e.target.value = "";
                }
              }}
            />
          </div>
        </div>

        {/* Upload Queue Progress */}
        {uploadQueue.length > 0 && (
          <div className="mt-6 border-t border-line pt-4 text-left space-y-2">
            <div className="flex items-center justify-between text-xs text-ink-muted font-medium mb-1">
              <span>Active Uploads ({uploadQueue.filter((q) => q.status !== "done").length} remaining)</span>
              <button
                type="button"
                onClick={() => setUploadQueue([])}
                className="text-brand hover:underline"
              >
                Clear Queue
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {uploadQueue.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl border border-line bg-surface text-xs flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-surface-alt shrink-0 relative">
                    <Image
                      src={item.previewUrl}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium text-ink">
                      {item.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-surface-alt rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            item.status === "error"
                              ? "bg-red-500"
                              : item.status === "done"
                              ? "bg-green-500"
                              : "bg-brand"
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-ink-muted shrink-0 capitalize">
                        {item.status}
                      </span>
                    </div>
                  </div>
                  {item.status === "error" && (
                    <span title={item.error} className="inline-flex shrink-0">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    </span>
                  )}
                  {item.status === "done" && (
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { key: "all", label: "All Media" },
              { key: "unused", label: "Unused" },
              { key: "missing-alt", label: "Missing Alt" },
              { key: "trash", label: "Trash" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => handleFilterChange(t.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === t.key
                  ? "bg-brand text-white shadow-xs"
                  : "bg-white text-ink-muted hover:text-ink border border-line"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search filenames, alt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-line focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </form>
      </div>

      {/* 4. Media Grid */}
      {isPending ? (
        <div className="py-20 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand mx-auto mb-2" />
          <p className="text-xs text-ink-muted">Loading media...</p>
        </div>
      ) : data.items.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-line p-8">
          <FileImage className="w-10 h-10 text-ink-muted/40 mx-auto mb-2" />
          <p className="text-sm font-semibold text-ink">No media items found</p>
          <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
            {filter === "trash"
              ? "Trash is empty."
              : filter === "missing-alt"
              ? "All active images have alt text or are marked decorative."
              : filter === "unused"
              ? "All media assets are currently referenced in blog posts."
              : "Upload images above to build your clinical media library."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {data.items.map((item) => {
            const hasMissingAlt = !item.decorative && !item.alt;
            return (
              <div
                key={item.id}
                onClick={() => openDetailDrawer(item)}
                className={`group relative rounded-2xl border bg-white overflow-hidden shadow-xs cursor-pointer transition-all hover:shadow-card hover:-translate-y-0.5 ${
                  selectedMedia?.id === item.id
                    ? "border-brand ring-2 ring-brand/30"
                    : "border-line"
                }`}
              >
                {/* Thumbnail 1:1 Aspect Ratio */}
                <div className="aspect-square relative w-full bg-surface-alt overflow-hidden">
                  <Image
                    loader={cloudinaryLoader}
                    src={item.publicId}
                    alt={item.alt || ""}
                    role={item.decorative ? "presentation" : undefined}
                    fill
                    placeholder={item.blurDataUrl ? "blur" : "empty"}
                    blurDataURL={item.blurDataUrl || undefined}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Badges Overlay */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {item.usageCount > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-white/95 text-ink shadow-xs backdrop-blur-xs">
                        {item.usageCount} {item.usageCount === 1 ? "post" : "posts"}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-black/60 text-white/90 backdrop-blur-xs">
                        Unused
                      </span>
                    )}

                    {hasMissingAlt && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500 text-white shadow-xs">
                        No Alt
                      </span>
                    )}
                  </div>
                </div>

                {/* Caption / Title */}
                <div className="p-2 sm:p-2.5">
                  <p className="text-xs font-medium text-ink truncate" title={item.displayName}>
                    {item.displayName}
                  </p>
                  <p className="text-[10px] text-ink-muted mt-0.5 font-mono">
                    {item.width}×{item.height} • {(item.bytes / 1024).toFixed(0)} KB
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Detail Drawer Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col border-l border-line overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-sm z-10">
              <h3 className="font-bold text-sm text-ink truncate max-w-[280px]">
                {selectedMedia.displayName}
              </h3>
              <button
                type="button"
                onClick={closeDetailDrawer}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preview Image */}
            <div className="p-5 bg-surface-alt border-b border-line text-center">
              <div className="relative aspect-[16/10] max-h-56 mx-auto rounded-xl overflow-hidden border border-line bg-white shadow-xs">
                <Image
                  loader={cloudinaryLoader}
                  src={selectedMedia.publicId}
                  alt={selectedMedia.alt || ""}
                  fill
                  placeholder={selectedMedia.blurDataUrl ? "blur" : "empty"}
                  blurDataURL={selectedMedia.blurDataUrl || undefined}
                  sizes="400px"
                  className="object-contain"
                />
              </div>
            </div>

            {/* Metadata & Controls */}
            <div className="p-5 space-y-6 flex-1">
              {/* Properties Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-surface border border-line/60">
                  <div className="text-[10px] text-ink-muted uppercase tracking-wider">Dimensions</div>
                  <div className="font-semibold text-ink font-mono mt-0.5">
                    {selectedMedia.width} × {selectedMedia.height}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-surface border border-line/60">
                  <div className="text-[10px] text-ink-muted uppercase tracking-wider">File Size</div>
                  <div className="font-semibold text-ink font-mono mt-0.5">
                    {(selectedMedia.bytes / 1024).toFixed(1)} KB ({selectedMedia.format})
                  </div>
                </div>
              </div>

              {/* Public ID with Copy */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Public ID</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={selectedMedia.publicId}
                    className="flex-1 px-2.5 py-1.5 text-xs font-mono rounded-lg border border-line bg-surface text-ink-muted"
                  />
                  <button
                    type="button"
                    onClick={handleCopyPublicId}
                    className="px-2.5 py-1.5 rounded-lg border border-line hover:bg-surface text-xs font-medium text-ink flex items-center gap-1"
                  >
                    {copiedId ? (
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Alt Text & Decorative Configuration */}
              <div className="space-y-3 p-4 rounded-2xl bg-surface border border-line">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-ink">
                    Accessibility & Alt Text
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-ink/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingDecorative}
                      onChange={(e) => setEditingDecorative(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-brand focus:ring-brand accent-brand cursor-pointer"
                    />
                    <span>Mark decorative</span>
                  </label>
                </div>

                {!editingDecorative && (
                  <div>
                    <textarea
                      rows={2}
                      maxLength={200}
                      placeholder="Describe what is seen in the image for screen readers..."
                      value={editingAlt}
                      onChange={(e) => setEditingAlt(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-line focus:outline-none focus:ring-1 focus:ring-brand bg-white"
                    />
                    <div className="text-[10px] text-ink-muted text-right mt-1">
                      {editingAlt.length}/200 characters
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSaveAlt}
                  disabled={isSavingAlt}
                  className="w-full py-2 rounded-xl text-xs font-semibold bg-brand text-white hover:bg-brand-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSavingAlt && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Alt Text</span>
                </button>
              </div>

              {/* Post Usage List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink">Referenced in Posts</span>
                  <span className="text-ink-muted">{selectedUsage.length} post(s)</span>
                </div>

                {isLoadingUsage ? (
                  <div className="py-4 text-center text-xs text-ink-muted">
                    Checking post usage...
                  </div>
                ) : selectedUsage.length === 0 ? (
                  <p className="text-xs text-ink-muted italic">
                    Not currently used in any published or draft posts.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {selectedUsage.map((u) => (
                      <div
                        key={`${u.id}-${u.role}`}
                        className="p-2 rounded-lg border border-line bg-surface text-xs flex items-center justify-between"
                      >
                        <div className="truncate pr-2">
                          <span className="font-medium text-ink">{u.title}</span>
                          <span className="ml-1 text-[10px] text-ink-muted uppercase">
                            ({u.role})
                          </span>
                        </div>
                        <Link
                          href={`/ow/posts/${u.id}/edit`}
                          className="text-brand hover:underline shrink-0 text-[11px] flex items-center gap-0.5"
                        >
                          Edit <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delete Blocked Warning Modal Banner */}
              {deleteBlockedPosts && (
                <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-900 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-800">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Cannot Delete: In Use</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    This media asset is referenced by {deleteBlockedPosts.length} post(s). Please remove it from the posts before moving to trash.
                  </p>
                </div>
              )}

              {/* Actions Footer */}
              <div className="pt-4 border-t border-line flex items-center justify-between gap-3">
                {selectedMedia.deletedAt ? (
                  <button
                    type="button"
                    onClick={handleRestoreMedia}
                    className="flex-1 py-2 px-3 rounded-xl border border-line bg-white hover:bg-surface text-xs font-semibold text-ink flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore from Trash</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDeleteMedia}
                    className="py-2 px-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-600 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Move to Trash</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
