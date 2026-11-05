import { Suspense } from "react";
import { requireOwner } from "@/src/server/auth/guard";
import { getOwnerPostsList, PostTab, PostSortField } from "@/src/server/owner/posts/queries";
import { ownerHref } from "@/src/lib/owner-url";
import { OwnerHeader } from "../owner-header";
import { PostsListView } from "./posts-list-view";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Posts Management | Owner Portal",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

interface PostsPageProps {
  searchParams: Promise<{
    tab?: string;
    search?: string;
    category?: string;
    sort?: string;
    order?: string;
    page?: string;
  }>;
}

async function PostsContent({ searchParams }: PostsPageProps) {
  // 1. Guard check: Must be owner with verified 2FA
  const { user: owner } = await requireOwner();

  const params = await searchParams;
  const tab = (params.tab as PostTab) || "all";
  const search = params.search || "";
  const category = params.category || "";
  const sort = (params.sort as PostSortField) || "updated";
  const order = (params.order as "asc" | "desc") || "desc";
  const page = parseInt(params.page || "1", 10) || 1;

  const data = await getOwnerPostsList({
    tab,
    search,
    category,
    sort,
    order,
    page,
    limit: 20,
  });

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <OwnerHeader ownerEmail={owner.email} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <PostsListView
          initialData={data}
          currentQuery={{ tab, search, category, sort, order, page }}
          baseOwnerPath={ownerHref("")}
        />
      </main>
    </div>
  );
}

export default function OwnerPostsPage(props: PostsPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      }
    >
      <PostsContent {...props} />
    </Suspense>
  );
}
