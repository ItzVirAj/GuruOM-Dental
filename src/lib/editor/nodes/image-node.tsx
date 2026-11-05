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
  Maximize2,
  Minimize2,
  Sliders,
  Image as ImageIcon,
} from "lucide-react";
import cloudinaryLoader from "@/src/lib/media/cloudinary-loader";

interface ImageNodeAttrs {
  mediaId: string;
  publicId?: string;
  width?: number;
  height?: number;
  alt?: string;
  caption?: string;
  layout?: "normal" | "wide";
}

function ImageNodeView(props: NodeViewProps) {
  const { node, updateAttributes, deleteNode, selected } = props;
  const { mediaId, publicId, alt, caption, layout = "normal" } = (node.attrs || {}) as ImageNodeAttrs;

  const [showSettings, setShowSettings] = useState(false);
  const [editingAlt, setEditingAlt] = useState(alt || "");
  const [editingCaption, setEditingCaption] = useState(caption || "");

  const handleSaveSettings = () => {
    updateAttributes({
      alt: editingAlt.trim() || undefined,
      caption: editingCaption.trim() || undefined,
    });
    setShowSettings(false);
  };

  const toggleLayout = () => {
    updateAttributes({ layout: layout === "wide" ? "normal" : "wide" });
  };

  const isWide = layout === "wide";

  return (
    <NodeViewWrapper
      className={`relative my-6 group transition-all select-none ${
        isWide ? "max-w-4xl -mx-4 sm:-mx-8" : "max-w-2xl mx-auto"
      }`}
    >
      <div
        className={`rounded-2xl overflow-hidden border bg-surface-alt transition-all ${
          selected ? "ring-2 ring-brand border-brand shadow-card" : "border-line shadow-xs"
        }`}
      >
        {/* Floating Toolbar on hover / selection */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 p-1 rounded-xl bg-black/75 text-white backdrop-blur-xs z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={toggleLayout}
            title={isWide ? "Change to Normal width" : "Change to Wide width"}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            {isWide ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setShowSettings((v) => !v)}
            title="Edit Alt Text & Caption"
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={deleteNode}
            title="Remove Image"
            className="p-1.5 rounded-lg hover:bg-red-500/80 text-white transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Drag Handle */}
        <div
          data-drag-handle
          className="absolute top-3 left-3 p-1 rounded-lg bg-black/60 text-white/80 backdrop-blur-xs cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-20"
          title="Drag image block"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        {/* Image Display */}
        <div className="relative aspect-[16/10] w-full bg-surface-alt flex items-center justify-center overflow-hidden">
          {publicId ? (
            <Image
              loader={cloudinaryLoader}
              src={publicId}
              alt={alt || ""}
              fill
              sizes={isWide ? "(max-width: 1024px) 100vw, 900px" : "(max-width: 768px) 100vw, 650px"}
              className="object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-ink-muted text-xs p-6">
              <ImageIcon className="w-8 h-8 mb-2 opacity-40 text-brand" />
              <span>Cloudinary Image (ID: {mediaId.slice(0, 8)}...)</span>
            </div>
          )}
        </div>

        {/* Inline Caption Bar */}
        <div className="p-2 sm:p-2.5 bg-white border-t border-line flex items-center justify-between text-xs">
          <input
            type="text"
            placeholder="Add image caption..."
            value={caption || ""}
            onChange={(e) => updateAttributes({ caption: e.target.value })}
            className="flex-1 bg-transparent px-2 py-0.5 text-center text-xs italic text-ink-muted placeholder:text-ink-muted/50 focus:outline-none focus:text-ink"
          />
          {alt && (
            <span
              className="px-2 py-0.5 text-[10px] font-mono bg-surface rounded-md text-ink-muted shrink-0"
              title={`Alt: "${alt}"`}
            >
              Alt set
            </span>
          )}
        </div>
      </div>

      {/* Popover Settings Dialog */}
      {showSettings && (
        <div className="absolute top-12 right-3 w-80 p-4 rounded-2xl bg-white border border-line shadow-2xl z-30 space-y-3 text-xs">
          <div className="flex items-center justify-between font-bold text-ink">
            <span>Image Settings</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-brand/10 text-brand">
              {layout}
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-ink">
              Alt Text (Accessibility)
            </label>
            <input
              type="text"
              maxLength={200}
              placeholder="Describe image for screen readers..."
              value={editingAlt}
              onChange={(e) => setEditingAlt(e.target.value)}
              className="w-full p-2 text-xs rounded-xl border border-line focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-ink">Caption</label>
            <input
              type="text"
              placeholder="Caption text..."
              value={editingCaption}
              onChange={(e) => setEditingCaption(e.target.value)}
              className="w-full p-2 text-xs rounded-xl border border-line focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="pt-1 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="px-3 py-1.5 rounded-lg border border-line hover:bg-surface font-semibold text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveSettings}
              className="px-3 py-1.5 rounded-lg bg-brand text-white font-semibold hover:bg-brand-dark"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
}

export const ImageNode = Node.create({
  name: "image",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      mediaId: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-media-id"),
        renderHTML: (attrs) => (attrs.mediaId ? { "data-media-id": attrs.mediaId } : {}),
      },
      publicId: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-public-id"),
        renderHTML: (attrs) => (attrs.publicId ? { "data-public-id": attrs.publicId } : {}),
      },
      width: {
        default: null,
        parseHTML: (el) => Number(el.getAttribute("data-width")) || null,
        renderHTML: (attrs) => (attrs.width ? { "data-width": attrs.width } : {}),
      },
      height: {
        default: null,
        parseHTML: (el) => Number(el.getAttribute("data-height")) || null,
        renderHTML: (attrs) => (attrs.height ? { "data-height": attrs.height } : {}),
      },
      alt: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-alt"),
        renderHTML: (attrs) => (attrs.alt ? { "data-alt": attrs.alt } : {}),
      },
      caption: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-caption"),
        renderHTML: (attrs) => (attrs.caption ? { "data-caption": attrs.caption } : {}),
      },
      layout: {
        default: "normal",
        parseHTML: (el) => el.getAttribute("data-layout") || "normal",
        renderHTML: (attrs) => ({ "data-layout": attrs.layout || "normal" }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="image-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "image-block",
        class: "editor-image-block",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});
