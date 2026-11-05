"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  Search,
  UploadCloud,
  Check,
  Loader2,
  FileImage,
  AlertCircle,
} from "lucide-react";
import {
  listMediaAction,
  uploadMediaAction,
  type MediaItem,
} from "@/src/server/owner/media/actions";
import { clientResizeImage } from "@/src/lib/media/client-resize";
import cloudinaryLoader from "@/src/lib/media/cloudinary-loader";

export interface SelectedMediaPayload {
  id: string;
  publicId: string;
  width: number;
  height: number;
  alt: string | null;
  decorative: boolean;
  displayName: string;
}

export interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: SelectedMediaPayload) => void;
  title?: string;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = "Select Image",
}: MediaPickerModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Upload tab state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [confirmedRights, setConfirmedRights] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load library items when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isCurrent = true;

    listMediaAction({ q: search, limit: 30 })
      .then((res) => {
        if (isCurrent) {
          setItems(res.items);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isCurrent) {
          console.error("Failed to load media in picker:", err);
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [isOpen, search]);

  if (!isOpen) return null;

  const handleSelectConfirm = () => {
    const item = items.find((it) => it.id === selectedId);
    if (!item) return;
    onSelect({
      id: item.id,
      publicId: item.publicId,
      width: item.width,
      height: item.height,
      alt: item.alt,
      decorative: item.decorative,
      displayName: item.displayName,
    });
    onClose();
  };

  const handleFileUpload = async (file: File) => {
    if (!confirmedRights) {
      alert("Please confirm you have the rights to upload this image.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setUploadError(null);

    try {
      // 1. Client downscale
      const { blob } = await clientResizeImage(file, {
        maxWidth: 2400,
        maxHeight: 2400,
        quality: 0.85,
        onProgress: (p) => setUploadProgress(10 + Math.round(p * 40)),
      });

      // 2. Upload to route
      setUploadProgress(60);
      const formData = new FormData();
      formData.append("file", blob, file.name.replace(/\.[^/.]+$/, ".webp"));
      formData.append("confirmedRights", "true");

      const uploaded = await uploadMediaAction(formData);
      setUploadProgress(100);

      onSelect({
        id: uploaded.id,
        publicId: uploaded.publicId,
        width: uploaded.width,
        height: uploaded.height,
        alt: uploaded.alt,
        decorative: uploaded.decorative,
        displayName: uploaded.displayName,
      });
      onClose();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-line flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-base text-ink">{title}</h2>
            <div className="flex items-center p-1 bg-surface rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("library")}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  activeTab === "library"
                    ? "bg-white text-ink shadow-xs"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Media Library
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  activeTab === "upload"
                    ? "bg-white text-ink shadow-xs"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Upload New
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab 1: Library */}
        {activeTab === "library" && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search */}
            <div className="p-4 border-b border-line bg-surface-alt/50">
              <div className="relative max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search media by filename..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-line focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 p-4 overflow-y-auto">
              {isLoading ? (
                <div className="py-20 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-brand mx-auto mb-2" />
                  <p className="text-xs text-ink-muted">Loading media...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="py-16 text-center text-xs text-ink-muted">
                  <FileImage className="w-8 h-8 mx-auto mb-2 text-ink-muted/50" />
                  No matching images found.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`group relative rounded-xl border overflow-hidden aspect-square cursor-pointer transition-all ${
                        selectedId === item.id
                          ? "border-brand ring-2 ring-brand/40 scale-[0.98]"
                          : "border-line hover:border-brand/40"
                      }`}
                    >
                      <Image
                        loader={cloudinaryLoader}
                        src={item.publicId}
                        alt={item.alt || ""}
                        fill
                        placeholder={item.blurDataUrl ? "blur" : "empty"}
                        blurDataURL={item.blurDataUrl || undefined}
                        sizes="160px"
                        className="object-cover"
                      />
                      {selectedId === item.id && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 pt-4">
                        <p className="text-[10px] text-white font-medium truncate">
                          {item.displayName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-line flex items-center justify-between bg-surface-alt/40">
              <span className="text-xs text-ink-muted">
                {selectedId
                  ? "1 image selected"
                  : "Click an image to select it"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-line bg-white hover:bg-surface text-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSelectConfirm}
                  disabled={!selectedId}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-brand text-white shadow-xs hover:bg-brand-dark transition-colors disabled:opacity-50"
                >
                  Insert Image
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Upload */}
        {activeTab === "upload" && (
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-brand/10 text-brand flex items-center justify-center">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink">Upload Image</h3>
              <p className="text-xs text-ink-muted mt-1 max-w-sm">
                Image will be automatically re-encoded to high-performance WebP
                and stored securely in Cloudinary.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="modal-rights"
                checked={confirmedRights}
                onChange={(e) => setConfirmedRights(e.target.checked)}
                className="w-4 h-4 rounded text-brand focus:ring-brand accent-brand cursor-pointer"
              />
              <label
                htmlFor="modal-rights"
                className="text-xs text-ink/80 cursor-pointer select-none"
              >
                I confirm I have the right to publish this image.
              </label>
            </div>

            {uploadError && (
              <div className="p-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {isUploading ? (
              <div className="w-full max-w-xs space-y-2">
                <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden border border-line">
                  <div
                    className="h-full bg-brand transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-ink-muted">
                  Processing and uploading ({uploadProgress}%)...
                </p>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!confirmedRights}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-brand text-white shadow-xs hover:bg-brand-dark transition-colors disabled:opacity-50"
                >
                  Choose Image File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
