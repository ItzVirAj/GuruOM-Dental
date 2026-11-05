import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, User, ArrowLeft, AlertCircle } from "lucide-react";
import { requireOwner } from "@/src/server/auth/guard";
import { getOwnerPostForEditing } from "@/src/server/owner/posts/queries";
import { ownerHref } from "@/src/lib/owner-url";
import { formatDate } from "@/src/lib/blog-format";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { SmartImage } from "@/components/ui/SmartImage";
import {
  BlogTableOfContents,
  BlogContent,
  TocItem,
  BlogAuthorBox,
} from "@/components/sections/blog";
import { calculateReadingTimeMinutes, type ContentBlock } from "@/src/lib/blog-content";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Preview (Unpublished) | Owner Portal",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

interface PreviewPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function PreviewContent({ params }: PreviewPageProps) {
  // 1. Guard check: Must be authenticated owner
  await requireOwner();

  const { id } = await params;
  const postData = await getOwnerPostForEditing(id);

  if (!postData) {
    notFound();
  }

  // 2. Prefer working copy data, fallback to committed post row
  interface PreviewPostData {
    title?: string;
    excerpt?: string;
    content?: ContentBlock[];
    categorySlug?: string;
    authorName?: string;
    authorRole?: string;
    reviewedByDoctorSlug?: string | null;
    coverSlot?: string | null;
  }

  const activeData: PreviewPostData =
    (postData.workingCopy?.data as PreviewPostData) || postData.post;
  const content = activeData.content || [];
  const title = activeData.title || postData.post.title;
  const categorySlug = activeData.categorySlug || postData.post.categorySlug;
  const categoryItem = postData.categories.find((c) => c.slug === categorySlug);
  const categoryLabel = categoryItem?.label || categorySlug;

  const readTime = calculateReadingTimeMinutes(content);
  const formattedDate = formatDate(postData.post.publishAt || new Date().toISOString());

  // Extract H2 and H3 items for Table of Contents
  const tocItems: TocItem[] = content
    .filter((b: ContentBlock) => b.type === "heading")
    .map((b: ContentBlock) => {
      const headingBlock = b as { type: "heading"; level: 2 | 3; text: string; id?: string };
      const generatedId =
        headingBlock.id ||
        headingBlock.text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
      return {
        id: generatedId,
        text: headingBlock.text,
        level: headingBlock.level,
      };
    });

  return (
    <div className="min-h-screen bg-white">
      {/* Preview Mode Sticky Header */}
      <div className="bg-amber-500 text-amber-950 px-4 py-2.5 text-xs font-semibold flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-900" />
          <span>
            PREVIEW MODE — Viewing working copy. This content is not published live to patients.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={ownerHref(`/posts/${id}/edit`)}
            className="px-3 py-1 bg-amber-900 text-white rounded-lg hover:bg-amber-950 transition-colors text-xs font-bold inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Editor</span>
          </Link>
        </div>
      </div>

      {/* Post Header with Breadcrumbs & Meta Row */}
      <PageHeader
        eyebrow={categoryLabel || "Clinical Journal"}
        title={title}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: categoryLabel || "Category", href: "/blog" },
          { label: title },
        ]}
      >
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-white/80 pt-2 font-body">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            <span>Preview Date: {formattedDate}</span>
          </span>

          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            <span>~{readTime} min read</span>
          </span>

          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            <span>{activeData.authorName || "Editorial Team"}</span>
          </span>
        </div>
      </PageHeader>

      {/* Main Layout */}
      <div className="py-12 sm:py-16 md:py-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Main Article Column */}
            <div className="lg:col-span-8 max-w-[740px] w-full mx-auto space-y-8">
              {/* Cover slot preview */}
              {activeData.coverSlot && (
                <div className="rounded-3xl overflow-hidden border border-line bg-surface-alt shadow-card">
                  <SmartImage
                    slot={activeData.coverSlot}
                    alt={title}
                    ratio="16/9"
                    priority={true}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Mobile Table of Contents */}
              <BlogTableOfContents items={tocItems} isMobileDisclosure={true} />

              {/* Rich Structured Article Content */}
              <article className="prose prose-neutral max-w-none">
                <BlogContent content={content} isOwnerPreview={true} />
              </article>

              {/* Author & Reviewer Box */}
              <BlogAuthorBox
                authorName={activeData.authorName || "Clinic Team"}
                authorRole={activeData.authorRole || "Dental Health"}
                reviewedBySlug={activeData.reviewedByDoctorSlug || undefined}
              />
            </div>

            {/* Desktop Sticky Table of Contents Sidebar */}
            <aside className="hidden lg:block lg:col-span-4 sticky top-24 space-y-8">
              <div className="p-6 rounded-3xl bg-surface border border-line shadow-card space-y-4">
                <h3 className="font-display font-bold text-sm text-ink uppercase tracking-wider">
                  Table of Contents
                </h3>
                <BlogTableOfContents items={tocItems} />
              </div>
            </aside>
          </div>
        </Container>
      </div>
    </div>
  );
}

export default function OwnerPostPreviewPage(props: PreviewPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      }
    >
      <PreviewContent {...props} />
    </Suspense>
  );
}
