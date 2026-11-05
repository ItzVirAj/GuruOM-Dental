"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import {
  X,
  Search,
  Play,
  Loader2,
  Video as VideoIcon,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import type { OwnerVideoItem } from "@/src/server/owner/videos/queries";
import {
  previewVideoLinkAction,
  createVideoAction,
  getOwnerVideosListAction,
} from "@/src/server/owner/videos/actions";
import cloudinaryLoader from "@/src/lib/media/cloudinary-loader";

export interface SelectedVideoPayload {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  youtubeId: string;
  status: "draft" | "published";
}

export interface VideoPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (video: SelectedVideoPayload) => void;
}

export function VideoPickerModal({
  isOpen,
  onClose,
  onSelect,
}: VideoPickerModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "link">("library");
  const [videos, setVideos] = useState<OwnerVideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Add by link state
  const [urlInput, setUrlInput] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{
    youtubeId: string;
    startSeconds: number | null;
    title: string;
    channelName?: string;
  } | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [description, setDescription] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [isCreating, startCreatingTransition] = useTransition();

  // Load videos when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;

    getOwnerVideosListAction()
      .then((items) => {
        if (mounted) {
          // Exclude trashed videos from picker
          setVideos(items.filter((v) => !v.deletedAt));
        }
      })
      .catch((err) => {
        console.error("Failed loading videos for picker:", err);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredVideos = videos.filter((v) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.title.toLowerCase().includes(q) ||
      v.channelName?.toLowerCase().includes(q) ||
      v.slug.toLowerCase().includes(q)
    );
  });

  const handleCheckLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsChecking(true);
    setCheckError(null);
    setPreviewData(null);

    try {
      const res = await previewVideoLinkAction(urlInput);
      setPreviewData(res);
      setCustomTitle(res.title);
      setDescription("");
    } catch (err: unknown) {
      setCheckError(
        err instanceof Error ? err.message : "Failed to verify YouTube URL."
      );
    } finally {
      setIsChecking(false);
    }
  };

  const handleCreateAndInsert = () => {
    if (!previewData || !consentChecked) return;

    startCreatingTransition(async () => {
      try {
        const created = await createVideoAction({
          url: urlInput,
          title: customTitle.trim() || previewData.title,
          description: description.trim() || previewData.title,
        });

        // Insert directly into editor
        onSelect({
          videoId: created.id,
          title: created.title,
          thumbnailUrl: "",
          youtubeId: previewData.youtubeId,
          status: "draft",
        });
        onClose();
      } catch (err: unknown) {
        setCheckError(
          err instanceof Error ? err.message : "Failed creating video."
        );
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-picker-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-line shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-line/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            </div>
            <div>
              <h3 id="video-picker-title" className="font-display font-bold text-base text-ink">
                Embed YouTube Video
              </h3>
              <p className="text-xs text-ink-muted">
                Select a video from your library or add a new YouTube link.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 border-b border-line flex items-center gap-4 bg-paper-sunken/40">
          <button
            type="button"
            onClick={() => setActiveTab("library")}
            className={`py-3 text-xs sm:text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "library"
                ? "border-brand text-brand font-semibold"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            Video Library ({videos.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("link")}
            className={`py-3 text-xs sm:text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "link"
                ? "border-brand text-brand font-semibold"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            Add by Link
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {activeTab === "library" ? (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search library videos..."
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-line bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                />
              </div>

              {isLoading ? (
                <div className="py-16 text-center text-ink-muted">
                  <Loader2 className="w-6 h-6 animate-spin text-brand mx-auto mb-2" />
                  <p className="text-xs">Loading videos...</p>
                </div>
              ) : filteredVideos.length === 0 ? (
                <div className="py-16 text-center text-ink-muted space-y-2">
                  <VideoIcon className="w-8 h-8 mx-auto text-ink-muted/40" />
                  <p className="text-xs">No videos match your search.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("link")}
                    className="text-xs text-brand font-medium hover:underline inline-block mt-1"
                  >
                    + Add a new video by link
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                  {filteredVideos.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        onSelect({
                          videoId: v.id,
                          title: v.title,
                          thumbnailUrl: v.thumbnailUrl,
                          youtubeId: v.youtubeId,
                          status: v.status,
                        });
                        onClose();
                      }}
                      className="group p-3 rounded-2xl border border-line bg-surface hover:bg-white hover:border-brand/40 hover:shadow-sm transition-all text-left flex gap-3 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-ink/90 shrink-0">
                        {v.thumbnailUrl ? (
                          <Image
                            loader={cloudinaryLoader}
                            src={v.thumbnailUrl}
                            alt={v.title}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-4 h-4 fill-white text-white opacity-40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <Play className="w-4 h-4 fill-white text-white drop-shadow" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase tracking-wider ${
                              v.status === "published"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {v.status}
                          </span>
                          {v.categoryLabel && (
                            <span className="text-[10px] text-ink-muted truncate">
                              • {v.categoryLabel}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-semibold text-ink group-hover:text-brand line-clamp-2 leading-tight">
                          {v.title}
                        </h4>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Add by Link Tab */
            <div className="space-y-4">
              <form onSubmit={handleCheckLink} className="space-y-2">
                <label htmlFor="modal-yt-url" className="text-xs font-medium text-ink block">
                  YouTube Video URL
                </label>
                <div className="flex gap-2">
                  <input
                    id="modal-yt-url"
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-line bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand font-mono"
                  />
                  <button
                    type="submit"
                    disabled={isChecking || !urlInput.trim()}
                    className="px-4 py-2 bg-brand text-white rounded-xl text-xs font-medium disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                  >
                    {isChecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Check"}
                  </button>
                </div>
              </form>

              {checkError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{checkError}</span>
                </div>
              )}

              {previewData && (
                <div className="p-4 rounded-xl bg-surface border border-line space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Video Verified: {previewData.title}</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="font-medium text-ink block mb-1">
                        Title in Article
                      </label>
                      <input
                        type="text"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-line bg-white"
                      />
                    </div>

                    <div>
                      <label className="font-medium text-ink block mb-1">
                        Description / Summary (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief summary..."
                        className="w-full px-3 py-2 rounded-xl border border-line bg-white"
                      />
                    </div>

                    <label className="flex items-start gap-2 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consentChecked}
                        onChange={(e) => setConsentChecked(e.target.checked)}
                        className="mt-0.5 rounded border-line text-brand"
                      />
                      <span className="text-[11px] text-ink leading-tight">
                        I confirm this video is owned or authorized to be shown and does not identify patients without written consent.
                      </span>
                    </label>

                    <button
                      type="button"
                      disabled={isCreating || !consentChecked}
                      onClick={handleCreateAndInsert}
                      className="w-full mt-3 py-2.5 rounded-xl bg-brand hover:bg-brand-accent text-white font-medium text-xs shadow-xs disabled:opacity-40 flex items-center justify-center gap-1.5"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Importing & Inserting...
                        </>
                      ) : (
                        "Import and Insert into Post"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
