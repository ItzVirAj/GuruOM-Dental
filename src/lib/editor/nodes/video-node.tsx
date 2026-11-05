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
  AlertCircle,
  Video as VideoIcon,
  MessageSquare,
} from "lucide-react";
import cloudinaryLoader from "@/src/lib/media/cloudinary-loader";

interface VideoNodeAttrs {
  videoId: string;
  title?: string;
  thumbnailUrl?: string;
  youtubeId?: string;
  caption?: string;
  status?: "draft" | "published";
}

function VideoNodeView(props: NodeViewProps) {
  const { node, updateAttributes, deleteNode, selected } = props;
  const {
    title = "YouTube Video",
    thumbnailUrl,
    caption,
    status = "published",
  } = (node.attrs || {}) as VideoNodeAttrs;

  const [editingCaption, setEditingCaption] = useState(caption || "");
  const [showCaptionInput, setShowCaptionInput] = useState(Boolean(caption));

  const isDraft = status === "draft";

  const handleBlurCaption = () => {
    updateAttributes({
      caption: editingCaption.trim() || undefined,
    });
  };

  return (
    <NodeViewWrapper
      className="relative my-6 group max-w-2xl mx-auto select-none"
      data-drag-handle
    >
      <div
        className={`rounded-2xl overflow-hidden border bg-surface transition-all ${
          selected
            ? "ring-2 ring-brand border-brand shadow-card"
            : "border-line shadow-xs"
        }`}
      >
        {/* Floating Action Bar */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 p-1 rounded-xl bg-black/75 text-white backdrop-blur-xs z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => setShowCaptionInput((v) => !v)}
            title="Add or edit caption"
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={deleteNode}
            title="Delete video embed"
            className="p-1.5 rounded-lg hover:bg-red-500/50 text-red-300 hover:text-white transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <div
            className="p-1.5 cursor-grab active:cursor-grabbing text-white/70"
            title="Drag to reposition"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* 16:9 Thumbnail Area */}
        <div className="relative aspect-video w-full bg-ink/90 overflow-hidden">
          {thumbnailUrl ? (
            <Image
              loader={cloudinaryLoader}
              src={thumbnailUrl}
              alt={title}
              fill
              sizes="700px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-ink">
              <VideoIcon className="w-12 h-12 text-white/30" />
            </div>
          )}

          {/* Dark gradient & Badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20">
              YouTube Video
            </span>
            {isDraft && (
              <span className="px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-amber-500 text-amber-950 shadow-xs">
                Draft
              </span>
            )}
          </div>

          {/* Play Icon Graphic */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-brand/90 text-white flex items-center justify-center shadow-xl">
              <Play className="w-6 h-6 translate-x-0.5 fill-current" />
            </div>
          </div>

          {/* Title on Overlay */}
          <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
            <h4 className="font-display font-medium text-white text-sm sm:text-base line-clamp-1 drop-shadow">
              {title}
            </h4>
          </div>
        </div>

        {/* Draft Warning Notice */}
        {isDraft && (
          <div className="p-3 bg-amber-50 border-t border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              This video is a draft and will not show on the live post until it is published.
            </span>
          </div>
        )}

        {/* Caption Input / Display */}
        {showCaptionInput && (
          <div className="p-3 bg-surface border-t border-line">
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
