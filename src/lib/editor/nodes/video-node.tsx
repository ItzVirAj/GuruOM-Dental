import {
  Node,
  mergeAttributes,
  ReactNodeViewRenderer,
  NodeViewWrapper,
  type NodeViewProps,
} from "@tiptap/react";
import React, { useState } from "react";
import Image from "next/image";
import {
  GripVertical,
  Trash2,
  Play,
  Eye,
  EyeOff,
  Video as VideoIcon,
  MessageSquare,
  Loader2,
  AlertCircle,
} from "lucide-react";
import cloudinaryLoader from "@/src/lib/media/cloudinary-loader";
import { setVideoStatusAction } from "@/src/server/owner/videos/actions";

interface VideoNodeAttrs {
  videoId: string;
  title?: string;
  thumbnailUrl?: string;
  youtubeId?: string;
  caption?: string;
  status?: "draft" | "published";
  visible?: boolean;
}

function VideoNodeView(props: NodeViewProps) {
  const { node, updateAttributes, deleteNode, selected } = props;
  const {
    videoId,
    title = "YouTube Video",
    thumbnailUrl,
    caption,
    status = "published",
    visible = true,
  } = (node.attrs || {}) as VideoNodeAttrs;

  const [editingCaption, setEditingCaption] = useState(caption || "");
  const [showCaptionInput, setShowCaptionInput] = useState(Boolean(caption));
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const isDraft = status === "draft";
  const isVisible = visible !== false;

  const handleBlurCaption = () => {
    updateAttributes({
      caption: editingCaption.trim() || undefined,
    });
  };

  const handleToggleArticleVisibility = () => {
    updateAttributes({ visible: !isVisible });
  };

  const handlePublishLibraryVideo = async () => {
    if (!videoId || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    setStatusError(null);
    try {
      await setVideoStatusAction(videoId, "published");
      updateAttributes({ status: "published", visible: true });
    } catch (err) {
      setStatusError(
        err instanceof Error ? err.message : "Could not publish video."
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <NodeViewWrapper
      className="relative my-6 group max-w-2xl mx-auto select-none"
      data-drag-handle
    >
      <div
        className={`rounded-2xl overflow-hidden border bg-white transition-all ${
          selected
            ? "ring-2 ring-accent border-brand-dark shadow-card"
            : "border-line shadow-soft"
        } ${!isVisible ? "opacity-80" : ""}`}
      >
        {/* Persistent Top Control Bar (accessible on desktop, touch, & keyboard) */}
        <div className="px-3.5 py-2.5 bg-brand-dark text-white flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="p-1 -ml-1 cursor-grab active:cursor-grabbing text-white/60 hover:text-white"
              title="Drag to reposition"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </span>
            <span className="h-2 w-2 rounded-full bg-accent shrink-0" aria-hidden="true" />
            <span className="text-xs font-medium text-white/90 truncate">
              YouTube video
            </span>
            {isDraft && (
              <span className="rounded-md bg-amber-400/20 border border-amber-300/40 px-2 py-0.5 text-[11px] font-medium text-amber-200">
                Draft in library
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Public article visibility toggle */}
            <button
              type="button"
              onClick={handleToggleArticleVisibility}
              aria-pressed={isVisible}
              title={
                isVisible
                  ? "Visible to readers — click to hide from this post"
                  : "Hidden from readers — click to show in this post"
              }
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isVisible
                  ? "bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 border border-emerald-400/30"
                  : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/15"
              }`}
            >
              {isVisible ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Visible to readers</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hidden in post</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowCaptionInput((v) => !v)}
              title="Add or edit caption"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                showCaptionInput
                  ? "bg-white/20 text-white"
                  : "text-white/75 hover:bg-white/15 hover:text-white"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={deleteNode}
              title="Remove video embed"
              className="p-1.5 rounded-lg text-red-300 hover:bg-red-500/30 hover:text-white transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 16:9 Thumbnail Area */}
        <div className="relative aspect-video w-full bg-brand-dark overflow-hidden">
          {thumbnailUrl ? (
            <Image
              loader={cloudinaryLoader}
              src={thumbnailUrl}
              alt={title}
              fill
              sizes="700px"
              className={`object-cover transition-all ${!isVisible ? "grayscale-[40%] opacity-65" : ""}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-brand-dark">
              <VideoIcon className="w-12 h-12 text-white/30" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent pointer-events-none" />

          {/* Center Play / Hidden Badge */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {isVisible ? (
              <div className="w-14 h-14 rounded-full bg-brand-dark/90 border border-white/25 text-white flex items-center justify-center shadow-xl">
                <Play className="w-6 h-6 translate-x-0.5 fill-current" />
              </div>
            ) : (
              <div className="px-3.5 py-2 rounded-xl bg-black/75 border border-white/20 text-white text-xs font-medium flex items-center gap-2 backdrop-blur-xs">
                <EyeOff className="w-4 h-4 text-white/80" />
                <span>Hidden on live article</span>
              </div>
            )}
          </div>

          {/* Title on Overlay */}
          <div className="absolute bottom-3 left-3.5 right-3.5 pointer-events-none">
            <h4 className="font-just-serif font-normal text-white text-base sm:text-lg line-clamp-1 drop-shadow">
              {title}
            </h4>
          </div>
        </div>

        {/* Draft Library Status Action Banner */}
        {isDraft && (
          <div className="px-4 py-3 bg-accent-soft border-t border-accent/30 text-ink text-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-2 min-w-0 flex-1">
              <AlertCircle className="w-4 h-4 text-accent-deep shrink-0 mt-0.5" />
              <span className="leading-snug">
                This video is currently a draft in your Video Library, so readers cannot view it on the live article yet.
              </span>
            </div>
            <button
              type="button"
              onClick={handlePublishLibraryVideo}
              disabled={isUpdatingStatus}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-dark text-white font-medium hover:bg-brand disabled:opacity-50 transition-colors cursor-pointer shrink-0"
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing…</span>
                </>
              ) : (
                <span>Publish video</span>
              )}
            </button>
          </div>
        )}

        {statusError && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-red-700 text-xs">
            {statusError}
          </div>
        )}

        {/* Caption Input / Display */}
        {showCaptionInput && (
          <div className="px-4 py-2.5 bg-surface border-t border-line">
            <input
              type="text"
              value={editingCaption}
              onChange={(e) => setEditingCaption(e.target.value)}
              onBlur={handleBlurCaption}
              placeholder="Add video caption (optional)..."
              className="w-full text-xs text-center text-ink bg-transparent focus-visible:outline-none placeholder:text-ink-muted/60 italic"
            />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export const VideoNode = Node.create({
  name: "youtube",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      videoId: {
        default: null,
      },
      title: {
        default: null,
      },
      thumbnailUrl: {
        default: null,
      },
      youtubeId: {
        default: null,
      },
      status: {
        default: "published",
      },
      visible: {
        default: true,
      },
      caption: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="youtube"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "youtube" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoNodeView);
  },
});
