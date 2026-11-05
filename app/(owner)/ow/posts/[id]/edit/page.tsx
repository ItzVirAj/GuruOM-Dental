import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireOwner } from "@/src/server/auth/guard";
import { getOwnerPostForEditing } from "@/src/server/owner/posts/queries";
import { ownerHref } from "@/src/lib/owner-url";
import { EditorLoader } from "./editor-loader";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Edit Article | Owner Portal",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

interface EditPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function EditPostContent({ params }: EditPostPageProps) {
  // Guard check: Must be authenticated owner with verified 2FA
  await requireOwner();

  const { id } = await params;
  const postData = await getOwnerPostForEditing(id);

  if (!postData) {
    notFound();
  }

  return (
    <EditorLoader
      post={postData.post}
      coverMedia={postData.coverMedia}
      workingCopy={postData.workingCopy}
      revisions={postData.revisions}
      categories={postData.categories}
      baseOwnerPath={ownerHref("")}
      postsListHref={ownerHref("/posts")}
    />
  );
}

export default function OwnerEditPostPage(props: EditPostPageProps) {
  return (
    <Suspense
      fallback={
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
      }
    >
      <EditPostContent {...props} />
    </Suspense>
  );
}
