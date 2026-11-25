"use client";

import { useEffect, useState, useTransition } from "react";
import {
  X,
  Play,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  CornerDownRight,
  Link as LinkIcon,
} from "lucide-react";
import {
  previewVideoLinkAction,
  createVideoAction,
  setVideoStatusAction,
} from "@/src/server/owner/videos/actions";
import type { SelectedVideoPayload } from "@/components/editor/video-picker-modal";

export interface PastedYouTubeContext {
  url: string;
  youtubeId: string;
  sectionTitle: string;
  afterLineSnippet: string;
  insertFrom: number;
  insertTo: number;
  cursorPos: number;
  removeFrom?: number;
  removeTo?: number;
  blockBefore?: number;
}

export interface YouTubePasteModalProps {
  context: PastedYouTubeContext | null;
  onClose: () => void;
  onInsertVideo: (
    video: SelectedVideoPayload & { caption?: string },
    context: PastedYouTubeContext
  ) => void;
  onPasteAsTextLink: (context: PastedYouTubeContext) => void;
}

interface VerifiedVideoPreview {
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

export function YouTubePasteModal({
  context,
  onClose,
  onInsertVideo,
  onPasteAsTextLink,
}: YouTubePasteModalProps) {
  const [preview, setPreview] = useState<VerifiedVideoPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [visibleInArticle, setVisibleInArticle] = useState(true);
  const [publishToLibrary, setPublishToLibrary] = useState(true);
  const [consentChecked, setConsentChecked] = useState(false);
  const [isSubmitting, startSubmitTransition] = useTransition();

  useEffect(() => {
    if (!context) return;
    let active = true;

    previewVideoLinkAction(context.url)
      .then((res) => {
        if (!active) return;
        setPreview(res);
        setTitle(res.title);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Could not verify YouTube link."
        );
      });

    return () => {
      active = false;
    };
  }, [context]);

  if (!context) return null;

  const isChecking = !preview && !error;

  const handleConfirm = () => {
    if (!preview) return;

    if (preview.existingVideo) {
      const existing = preview.existingVideo;
      startSubmitTransition(async () => {
        try {
          let nextStatus = existing.status;
          if (publishToLibrary && existing.status === "draft") {
            await setVideoStatusAction(existing.id, "published");
            nextStatus = "published";
          }
          onInsertVideo(
            {
              videoId: existing.id,
              title: existing.title,
              thumbnailUrl: existing.thumbnailUrl,
              youtubeId: preview.youtubeId,
              status: nextStatus,
              visible: visibleInArticle,
              caption: caption.trim() || undefined,
            },
            context
          );
          onClose();
        } catch (err: unknown) {
          setError(
            err instanceof Error ? err.message : "Could not insert video."
          );
        }
      });
      return;
    }

    if (!consentChecked) return;

    startSubmitTransition(async () => {
      try {
        const targetStatus = publishToLibrary ? "published" : "draft";
        const created = await createVideoAction({
          url: context.url,
          title: title.trim() || preview.title,
          description: title.trim() || preview.title,
          status: targetStatus,
        });

        onInsertVideo(
          {
            videoId: created.id,
            title: created.title,
            thumbnailUrl: created.thumbnailUrl,
            youtubeId: created.youtubeId,
            status: created.status,
            visible: visibleInArticle,
            caption: caption.trim() || undefined,
          },
          context
        );
        onClose();
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Could not add video."
        );
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="yt-paste-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full border border-line shadow-float overflow-hidden font-aileron">
        {/* Header */}
        <div className="px-6 py-4 bg-brand-dark text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
            <div>
              <h3 id="yt-paste-title" className="font-just-serif text-xl font-normal text-white">
                Add YouTube video to section
              </h3>
              <p className="text-xs text-white/70">
                Pasted YouTube link detected in the editor.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cancel paste"
            className="p-2 rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 bg-surface/50">
          {/* Exact Section Placement Context */}
          <div className="rounded-xl border border-line bg-white p-3.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-ink-muted font-medium">Target section</span>
              <span className="font-semibold text-ink truncate max-w-[70%]">
                {context.sectionTitle}
              </span>
            </div>
            <div className="flex items-start gap-2 pt-1 border-t border-line/60 text-ink-muted">
              <CornerDownRight className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
              <span className="leading-snug break-words">
                {context.afterLineSnippet
                  ? `Will be inserted right after: "${context.afterLineSnippet}"`
                  : "Will be inserted on the current blank line in this section."}
              </span>
            </div>
          </div>

          {isChecking && (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-ink-muted text-xs">
              <Loader2 className="w-5 h-5 animate-spin text-brand" />
              <span>Verifying YouTube link…</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {preview && (
            <div className="space-y-4">
              {/* Verified Banner */}
              <div className="rounded-xl border border-line bg-white p-3.5 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-dark text-white flex items-center justify-center shrink-0">
                  <Play className="w-4 h-4 fill-current translate-x-0.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {preview.existingVideo
                        ? "Already in Video Library"
                        : "Verified on YouTube"}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-ink mt-0.5 line-clamp-2">
                    {preview.existingVideo ? preview.existingVideo.title : preview.title}
                  </p>
                  {preview.channelName && (
                    <p className="text-xs text-ink-muted mt-0.5">{preview.channelName}</p>
                  )}
                </div>
              </div>

              {!preview.existingVideo && (
                <div>
                  <label htmlFor="yt-paste-heading" className="block text-xs font-medium text-ink mb-1">
                    Video title
                  </label>
                  <input
                    id="yt-paste-heading"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-line bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              )}

              <div>
                <label htmlFor="yt-paste-caption" className="block text-xs font-medium text-ink mb-1">
                  Article caption (optional)
                </label>
                <input
                  id="yt-paste-caption"
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add context for readers..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-line bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {/* Visibility Controls */}
              <div className="rounded-xl border border-line bg-white p-3.5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-ink">Article visibility</p>
                    <p className="text-[11px] text-ink-muted">
                      Control whether readers see this embed on the published article.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVisibleInArticle((v) => !v)}
                    aria-pressed={visibleInArticle}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer shrink-0 ${
                      visibleInArticle
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                        : "border-line bg-surface text-ink-muted"
                    }`}
                  >
                    {visibleInArticle ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>
                </div>

                {(!preview.existingVideo || preview.existingVideo.status === "draft") && (
                  <label className="flex items-start gap-2.5 pt-2.5 border-t border-line/70 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={publishToLibrary}
                      onChange={(e) => setPublishToLibrary(e.target.checked)}
                      className="mt-0.5 rounded border-line accent-brand-dark cursor-pointer"
                    />
                    <span className="text-xs text-ink leading-snug">
                      Publish video in Video Library immediately so readers can play it live
                    </span>
                  </label>
                )}
              </div>

              {!preview.existingVideo && (
                <label className="flex items-start gap-2 cursor-pointer">
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
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-line/70">
            {context.removeFrom === undefined ? (
              <button
                type="button"
                onClick={() => {
                  onPasteAsTextLink(context);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-line bg-white hover:bg-surface text-xs font-medium text-ink transition-colors cursor-pointer"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Paste as link instead</span>
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl border border-line bg-white hover:bg-surface text-xs font-medium text-ink transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  isChecking ||
                  !preview ||
                  isSubmitting ||
                  (!preview.existingVideo && !consentChecked)
                }
                onClick={handleConfirm}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-dark hover:bg-brand text-white text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Adding…</span>
                  </>
                ) : (
                  <span>Add video to section</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
