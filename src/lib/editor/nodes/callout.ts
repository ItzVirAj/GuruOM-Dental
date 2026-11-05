import { Node, mergeAttributes } from "@tiptap/react";

export interface CalloutOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (attributes?: { tone?: "tip" | "note" | "warning"; title?: string }) => ReturnType;
      toggleCallout: (attributes?: { tone?: "tip" | "note" | "warning"; title?: string }) => ReturnType;
    };
  }
}

export const Callout = Node.create<CalloutOptions>({
  name: "callout",

  group: "block",

  content: "paragraph+",

  defining: true,

  addAttributes() {
    return {
      tone: {
        default: "note",
        parseHTML: (element) => element.getAttribute("data-tone") || "note",
        renderHTML: (attributes) => ({
          "data-tone": attributes.tone,
        }),
      },
      title: {
        default: "Note",
        parseHTML: (element) => element.getAttribute("data-title") || "Note",
        renderHTML: (attributes) => ({
          "data-title": attributes.title,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const tone = HTMLAttributes["data-tone"] || "note";
    const title = HTMLAttributes["data-title"] || "Note";

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "callout",
        class: `editor-callout editor-callout-${tone}`,
      }),
      [
        "div",
        { class: "editor-callout-title font-semibold text-sm mb-1 select-none", contenteditable: "false" },
        title,
      ],
      ["div", { class: "editor-callout-body" }, 0],
    ];
  },

  addCommands() {
    return {
      setCallout:
        (attributes) =>
        ({ commands }) => {
          return commands.setNode(this.name, attributes);
        },
      toggleCallout:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, attributes);
        },
    };
  },
});
