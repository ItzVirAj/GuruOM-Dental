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
  Eye,
} from "lucide-react";
import {
  listMediaAction,
  uploadMediaAction,
  type MediaItem,
} from "@/src/server/owner/media/actions";
import { clientCropAndResizeImage } from "@/src/lib/media/client-resize";
import cloudinaryLoader from "@/src/lib/media/cloudinary-loader";
import {
  ImageCropPreview,
  type AspectPreset,
  type PreviewConfirmPayload,
} from "@/components/editor/image-crop-preview";

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
  defaultAspect?: AspectPreset;
}

type PreviewSource =
  | {
      mode: "upload";
      file: File;
      objectUrl: string;
      width: number;
      height: number;
    }
  | {
      mode: "library";
      item: MediaItem;
      fullUrl: string;
    };

const ACCEPTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

async function readLocalImageDimensions(
  file: File
): Promise<{ width: number; height: number; objectUrl: string }> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = new window.Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Could not decode image file."));
      img.src = objectUrl;
    });
    if (!img.naturalWidth || !img.naturalHeight) {
      throw new Error("Could not read image dimensions.");
    }
    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
      objectUrl,
    };
  } catch (err) {
    URL.revokeObjectURL(objectUrl);
    throw err;
  }
}

function toSelectedPayload(item: {
  id: string;
  publicId: string;
  width: number;
  height: number;
  alt: string | null;
  decorative: boolean;
  displayName: string;
}): SelectedMediaPayload {
  return {
    id: item.id,
    publicId: item.publicId,
    width: item.width,
    height: item.height,
    alt: item.alt,
    decorative: item.decorative,
    displayName: item.displayName,
  };
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = "Select Image",
  defaultAspect = "free",
}: MediaPickerModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Preview / crop stage state
  const [previewSource, setPreviewSource] = useState<PreviewSource | null>(
    null
  );

  // Upload / processing state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [confirmedRights, setConfirmedRights] = useState(true);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeObjectUrlRef = useRef<string | null>(null);

  const revokeActiveObjectUrl = () => {
    if (activeObjectUrlRef.current) {
      URL.revokeObjectURL(activeObjectUrlRef.current);
      activeObjectUrlRef.current = null;
    }
  };

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

  const handleModalClose = () => {
    if (isUploading) return;
    revokeActiveObjectUrl();
    setPreviewSource(null);
    setUploadError(null);
    setSelectedId(null);
    onClose();
  };

  const openLibraryPreview = (targetId = selectedId) => {
    const item = items.find((it) => it.id === targetId);
    if (!item) return;
    setUploadError(null);
    revokeActiveObjectUrl();
    const fullUrl = cloudinaryLoader({ src: item.publicId, width: 2400 });
    setPreviewSource({
      mode: "library",
      item,
      fullUrl,
    });
  };

  const handleFileSelected = async (file: File) => {
    setUploadError(null);
    if (file.type && !ACCEPTED_MIME_TYPES.has(file.type.toLowerCase())) {
      setUploadError(
        "Unsupported file format. Please choose a JPG, PNG, WebP, or AVIF image."
      );
      return;
    }

    try {
      const { width, height, objectUrl } = await readLocalImageDimensions(file);
      revokeActiveObjectUrl();
      activeObjectUrlRef.current = objectUrl;
      setPreviewSource({
        mode: "upload",
        file,
        objectUrl,
        width,
        height,
      });
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Failed to load selected image."
      );
    }
  };

  const handlePreviewBack = () => {
    if (isUploading) return;
    revokeActiveObjectUrl();
    setPreviewSource(null);
    setUploadError(null);
  };

  const handlePreviewConfirm = async (payload: PreviewConfirmPayload) => {
    if (!previewSource) return;

    // Fast path: untouched library asset
    if (previewSource.mode === "library" && !payload.hasEdits) {
      onSelect(toSelectedPayload(previewSource.item));
      revokeActiveObjectUrl();
      setPreviewSource(null);
      setSelectedId(null);
      onClose();
      return;
    }

    if (!confirmedRights) {
      setUploadError(
        "Please confirm you have the right to upload and publish this image."
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setUploadError(null);

    try {
      const sourceInput =
        previewSource.mode === "upload"
          ? previewSource.file
          : previewSource.fullUrl;

      const { blob } = await clientCropAndResizeImage(sourceInput, {
        crop: payload.crop,
        rotation: payload.rotation,
        maxWidth: payload.maxWidth,
        maxHeight: payload.maxHeight,
        quality: payload.quality,
        onProgress: (p) => setUploadProgress(10 + Math.round(p * 45)),
      });

      setUploadProgress(65);

      const baseName =
        previewSource.mode === "upload"
          ? previewSource.file.name.replace(/\.[^/.]+$/, "")
          : `${previewSource.item.displayName}-cropped`;

      const formData = new FormData();
      formData.append("file", blob, `${baseName}.webp`);
      formData.append("confirmedRights", "true");
      if (payload.decorative) {
        formData.append("decorative", "true");
      } else if (payload.alt.trim()) {
        formData.append("alt", payload.alt.trim());
      }

      const uploaded = await uploadMediaAction(formData);
      setUploadProgress(100);

      onSelect(toSelectedPayload(uploaded));
      revokeActiveObjectUrl();
      setPreviewSource(null);
      setSelectedId(null);
      onClose();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleInsertOriginalLibrary = () => {
    if (previewSource?.mode !== "library") return;
    onSelect(toSelectedPayload(previewSource.item));
    setPreviewSource(null);
    setSelectedId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/55 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-line flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-base text-ink">
              {previewSource ? `${title} — Preview, Crop & Size` : title}
            </h2>

            {!previewSource && (
              <div className="flex items-center p-1 bg-surface rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("library");
                    setUploadError(null);
                  }}
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
                  onClick={() => {
                    setActiveTab("upload");
                    setUploadError(null);
                  }}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    activeTab === "upload"
                      ? "bg-white text-ink shadow-xs"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  Upload New
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleModalClose}
            disabled={isUploading}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview, Crop & Resize Studio (always shown after picking a file or clicking Preview & Insert) */}
        {previewSource ? (
          <ImageCropPreview
            key={
              previewSource.mode === "upload"
                ? previewSource.objectUrl
                : previewSource.item.id
            }
            sourceUrl={
              previewSource.mode === "upload"
                ? previewSource.objectUrl
                : previewSource.fullUrl
            }
            initialWidth={
              previewSource.mode === "upload"
                ? previewSource.width
                : previewSource.item.width
            }
            initialHeight={
              previewSource.mode === "upload"
                ? previewSource.height
                : previewSource.item.height
            }
            fileName={
              previewSource.mode === "upload"
                ? previewSource.file.name
                : previewSource.item.displayName
            }
            initialAlt={
              previewSource.mode === "library"
                ? previewSource.item.alt || ""
                : ""
            }
            initialDecorative={
              previewSource.mode === "library"
                ? previewSource.item.decorative
                : false
            }
            mode={previewSource.mode}
            defaultAspect={defaultAspect}
            confirmedRights={confirmedRights}
            onConfirmedRightsChange={setConfirmedRights}
            isSubmitting={isUploading}
            submitProgress={uploadProgress}
            submitError={uploadError}
            onBack={handlePreviewBack}
            onCancel={handleModalClose}
            onConfirm={handlePreviewConfirm}
            onInsertOriginal={
              previewSource.mode === "library"
                ? handleInsertOriginalLibrary
                : undefined
            }
          />
        ) : (
          <>
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
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedId(item.id)}
                          onDoubleClick={() => openLibraryPreview(item.id)}
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
                            sizes="180px"
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
                      ? "1 image selected — preview, crop & adjust size before inserting"
                      : "Click an image to select it (or double-click to preview)"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleModalClose}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-line bg-white hover:bg-surface text-ink transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => openLibraryPreview()}
                      disabled={!selectedId}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-brand text-white shadow-xs hover:bg-brand-dark transition-colors disabled:opacity-50"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview & Insert</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Upload */}
            {activeTab === "upload" && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileSelected(file);
                }}
                className={`flex-1 m-6 rounded-2xl border-2 border-dashed p-8 flex flex-col items-center justify-center text-center space-y-4 transition-colors ${
                  isDraggingFile
                    ? "border-brand bg-brand/5"
                    : "border-line bg-surface-alt/30"
                }`}
              >
                <div className="w-16 h-16 rounded-3xl bg-brand/10 text-brand flex items-center justify-center">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink">
                    Choose or Drop an Image
                  </h3>
                  <p className="text-xs text-ink-muted mt-1 max-w-md">
                    After picking your image, the preview editor will open so you
                    can crop, resize, and verify how it looks before inserting.
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
                      e.target.value = "";
                      if (file) handleFileSelected(file);
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
