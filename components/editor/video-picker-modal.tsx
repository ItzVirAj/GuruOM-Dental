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
  Eye,
  EyeOff,
} from "lucide-react";
import type { OwnerVideoItem } from "@/src/server/owner/videos/queries";
import {
  previewVideoLinkAction,
  createVideoAction,
  getOwnerVideosListAction,
  setVideoStatusAction,
} from "@/src/server/owner/videos/actions";
import cloudinaryLoader from "@/src/lib/media/cloudinary-loader";

export interface SelectedVideoPayload {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  youtubeId: string;
  status: "draft" | "published";
  visible: boolean;
}

export interface VideoPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (video: SelectedVideoPayload) => void;
}

interface PreviewLinkState {
  youtubeId: string;
  startSeconds: number | null;
  title: string;
  channelName?: string;
  existingVideo: {
    id: string;
    title: string;
    thumbnailUrl: string;
    status: "draft" | "published";
  } | null;
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
  const [embedVisibleInPost, setEmbedVisibleInPost] = useState(true);

  // Add by link state
  const [urlInput, setUrlInput] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewLinkState | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [description, setDescription] = useState("");
  const [publishImmediately, setPublishImmediately] = useState(true);
  const [consentChecked, setConsentChecked] = useState(false);
  const [isCreating, startCreatingTransition] = useTransition();

  // Load videos when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;

    getOwnerVideosListAction()
      .then((items) => {
        if (mounted) {
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

  const handleCreateOrInsertExisting = () => {
    if (!previewData) return;

    if (previewData.existingVideo) {
      const existing = previewData.existingVideo;
      startCreatingTransition(async () => {
        try {
          let nextStatus = existing.status;
          if (publishImmediately && existing.status === "draft") {
            await setVideoStatusAction(existing.id, "published");
            nextStatus = "published";
          }
          onSelect({
            videoId: existing.id,
            title: existing.title,
            thumbnailUrl: existing.thumbnailUrl,
            youtubeId: previewData.youtubeId,
            status: nextStatus,
            visible: embedVisibleInPost,
          });
          onClose();
        } catch (err: unknown) {
          setCheckError(
            err instanceof Error ? err.message : "Failed updating video visibility."
          );
        }
      });
      return;
    }

    if (!consentChecked) return;

    startCreatingTransition(async () => {
      try {
        const targetStatus = publishImmediately ? "published" : "draft";
        const created = await createVideoAction({
          url: urlInput,
          title: customTitle.trim() || previewData.title,
          description: description.trim() || customTitle.trim() || previewData.title,
          status: targetStatus,
        });

        onSelect({
          videoId: created.id,
          title: created.title,
          thumbnailUrl: created.thumbnailUrl,
          youtubeId: created.youtubeId,
          status: created.status,
          visible: embedVisibleInPost,
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
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-line shadow-float overflow-hidden flex flex-col max-h-[86vh] font-aileron">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-brand-dark text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
            <div>
              <h3 id="video-picker-title" className="font-just-serif text-xl font-normal tracking-tight text-white">
                Embed YouTube video
              </h3>
              <p className="text-xs text-white/70">
                Choose from your library or paste a YouTube link.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close video picker"
            className="p-2 rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher + Embed Visibility Control */}
        <div className="px-6 border-b border-line flex flex-wrap items-center justify-between gap-3 bg-surface">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setActiveTab("library")}
              className={`py-3 text-xs sm:text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
                activeTab === "library"
                  ? "border-brand-dark text-ink font-semibold"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              Video library ({videos.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("link")}
              className={`py-3 text-xs sm:text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
                activeTab === "link"
                  ? "border-brand-dark text-ink font-semibold"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              Add by YouTube link
            </button>
          </div>

          <button
            type="button"
            onClick={() => setEmbedVisibleInPost((v) => !v)}
            aria-pressed={embedVisibleInPost}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              embedVisibleInPost
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-line bg-white text-ink-muted"
            }`}
          >
            {embedVisibleInPost ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Insert as visible</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Insert hidden in article</span>
              </>
            )}
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 flex-1 overflow-y-auto bg-surface/40">
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
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-line bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
                  <p className="text-sm">No matching videos in your library.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("link")}
                    className="text-xs text-brand font-semibold hover:underline inline-block mt-1 cursor-pointer"
                  >
                    Add a video using a YouTube link
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
                          visible: embedVisibleInPost,
                        });
                        onClose();
                      }}
                      className="group p-3 rounded-xl border border-line bg-white hover:border-brand-dark hover:shadow-soft transition-all text-left flex gap-3 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
                    >
                      <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-brand-dark shrink-0">
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
                            className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                              v.status === "published"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {v.status === "published" ? "Published" : "Draft"}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-ink group-hover:text-brand line-clamp-2 leading-snug">
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
                <label htmlFor="modal-yt-url" className="text-sm font-medium text-ink block">
                  YouTube link
                </label>
                <div className="flex gap-2">
                  <input
                    id="modal-yt-url"
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-line bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                  <button
                    type="submit"
                    disabled={isChecking || !urlInput.trim()}
                    className="px-4 py-2.5 bg-brand-dark hover:bg-brand text-white rounded-xl text-xs font-semibold disabled:opacity-40 flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {isChecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verify link"}
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
                <div className="p-4 rounded-xl bg-white border border-line space-y-3.5 animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {previewData.existingVideo
                        ? `Found in library: ${previewData.existingVideo.title}`
                        : `Verified: ${previewData.title}`}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    {!previewData.existingVideo && (
                      <>
                        <div>
                          <label className="font-medium text-ink block mb-1">
                            Video title
                          </label>
                          <input
                            type="text"
                            value={customTitle}
                            onChange={(e) => setCustomTitle(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-line bg-surface/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                        </div>

                        <div>
                          <label className="font-medium text-ink block mb-1">
                            Summary (optional)
                          </label>
                          <textarea
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief clinical summary..."
                            className="w-full px-3 py-2 rounded-xl border border-line bg-surface/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                        </div>
                      </>
                    )}

                    {/* Visibility & Publish option */}
                    {(!previewData.existingVideo || previewData.existingVideo.status === "draft") && (
                      <label className="flex items-start gap-2.5 p-3 rounded-xl bg-surface border border-line cursor-pointer">
                        <input
                          type="checkbox"
                          checked={publishImmediately}
                          onChange={(e) => setPublishImmediately(e.target.checked)}
                          className="mt-0.5 rounded border-line accent-brand-dark cursor-pointer"
                        />
                        <span className="text-xs text-ink leading-snug">
                          Publish to Video Library so this embed is visible on the live article immediately
                        </span>
                      </label>
                    )}

                    {!previewData.existingVideo && (
                      <label className="flex items-start gap-2 pt-0.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={consentChecked}
                          onChange={(e) => setConsentChecked(e.target.checked)}
                          className="mt-0.5 rounded border-line accent-brand-dark cursor-pointer"
                        />
                        <span className="text-[11px] text-ink-muted leading-tight">
                          I confirm this video is owned or authorized to be shown and does not identify patients without written consent.
                        </span>
                      </label>
                    )}

                    <button
                      type="button"
                      disabled={
                        isCreating ||
                        (!previewData.existingVideo && !consentChecked)
                      }
                      onClick={handleCreateOrInsertExisting}
                      className="w-full mt-2 py-2.5 rounded-xl bg-brand-dark hover:bg-brand text-white font-semibold text-xs shadow-xs disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Adding video…</span>
                        </>
                      ) : previewData.existingVideo ? (
                        <span>Insert video into post</span>
                      ) : (
                        <span>Add and insert video</span>
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
