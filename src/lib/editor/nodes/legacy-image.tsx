import {
  Node,
  mergeAttributes,
  ReactNodeViewRenderer,
  NodeViewWrapper,
  type NodeViewProps,
} from "@tiptap/react";
import React from "react";
import { Image as ImageIcon, RefreshCw } from "lucide-react";

function LegacyImageNodeView(props: NodeViewProps) {
  const { node, deleteNode, editor } = props;
  const { slot, url, caption } = (node.attrs || {}) as {
    slot?: string;
    url?: string;
    alt?: string;
    caption?: string;
  };
  const label = slot ? `Slot: ${slot}` : url ? `URL: ${url}` : "Slot: (unassigned)";

  const handleOpenPicker = () => {
    // Dispatch custom DOM event that PostEditorClient listens to
    window.dispatchEvent(
      new CustomEvent("guruom:replace-legacy-image", {
        detail: {
          replaceNode: (newMedia: { id: string; publicId: string; width: number; height: number; alt?: string; decorative?: boolean }) => {
            deleteNode();
            editor.commands.insertContent({
              type: "image",
              attrs: {
                mediaId: newMedia.id,
                publicId: newMedia.publicId,
                width: newMedia.width,
                height: newMedia.height,
                alt: newMedia.alt,
                layout: "normal",
              },
            });
          },
        },
      })
    );
  };

  return (
    <NodeViewWrapper className="my-4 select-none">
      <div className="p-4 bg-amber-500/5 border border-dashed border-amber-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-ink">Legacy Image Slot</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface border border-line text-ink-muted">
                {label}
              </span>
            </div>
            {caption && (
              <p className="text-[11px] text-ink-muted italic mt-0.5">
                Caption: &ldquo;{caption}&rdquo;
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenPicker}
          className="px-3.5 py-1.5 rounded-xl bg-white border border-line hover:border-brand/40 text-xs font-semibold text-ink shadow-xs flex items-center gap-1.5 shrink-0 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-brand" />
          <span>Choose Modern Image</span>
        </button>
      </div>
    </NodeViewWrapper>
  );
}

export const LegacyImage = Node.create({
  name: "legacyImage",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      slot: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-slot"),
        renderHTML: (attributes) =>
          attributes.slot ? { "data-slot": attributes.slot } : {},
      },
      url: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-url"),
        renderHTML: (attributes) =>
          attributes.url ? { "data-url": attributes.url } : {},
      },
      alt: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-alt"),
        renderHTML: (attributes) =>
          attributes.alt ? { "data-alt": attributes.alt } : {},
      },
      caption: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-caption"),
        renderHTML: (attributes) =>
          attributes.caption ? { "data-caption": attributes.caption } : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="legacy-image"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "legacy-image",
        class: "editor-legacy-image",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LegacyImageNodeView);
  },
});

