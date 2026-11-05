"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import type { PostEditorClient as PostEditorClientType } from "./post-editor-client";

const PostEditorDynamic = dynamic(
  () =>
    import("./post-editor-client").then((mod) => mod.PostEditorClient),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
        <div className="p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-black/[0.06] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col items-center space-y-3 max-w-xs text-center">
          <Loader2 className="w-6 h-6 animate-spin text-ink-muted" />
          <p className="text-xs text-ink font-medium">
            Opening Article Editor...
          </p>
          <p className="text-[11px] text-ink-muted">
            Preparing clinical draft environment
          </p>
        </div>
      </div>
    ),
  }
);

export function EditorLoader(props: ComponentProps<typeof PostEditorClientType>) {
  return <PostEditorDynamic {...props} />;
}
