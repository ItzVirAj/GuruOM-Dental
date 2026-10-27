import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { BlogHero, BlogGrid, BlogNewsletterBand } from "@/components/sections/blog";
import {
  getLivePosts,
  getFeaturedPost,
  getCategoriesWithCounts,
} from "@/src/server/blog/queries";
import { siteConfig } from "@/data/site";

interface BlogPageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Clinical Dental Journal & Oral Health Guides | GuruOm Dental",
  description:
    "Evidence-based dental health guides, preventive tips, and restorative treatment insights from specialist clinicians at GuruOm Dental in Ahilyanagar.",
  openGraph: {
    title: "Clinical Dental Journal | GuruOm Dental",
    description:
      "Dental health tips and clinical insights explained simply by our specialists.",
    url: `${siteConfig.url}/blog`,
    siteName: siteConfig.name,
    type: "website",
  },
  alternates: {
    canonical: "/blog",
  },
};

async function BlogContentContainer({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;

  const [categories, featuredPost, { posts: allLivePosts }] = await Promise.all([
    getCategoriesWithCounts(),
    getFeaturedPost(),
    getLivePosts({ limit: 24 }),
  ]);

  // Validate initial category from URL
  const validCategory = categories.some((c) => c.slug === params.category)
    ? params.category
    : "all";

  // Filter out featured post from regular grid
  const regularPosts = featuredPost
    ? allLivePosts.filter((p) => p.slug !== featuredPost.slug)
    : allLivePosts;

  return (
    <>
      {/* 2. Featured Post Card */}
      {featuredPost && <BlogHero post={featuredPost} />}

      {/* 3. Filterable & Searchable Post Grid */}
      <BlogGrid
        posts={regularPosts}
        categories={categories}
        initialCategory={validCategory}
      />
    </>
  );
}

function BlogLoadingFallback() {
  return (
    <div className="py-16 text-center animate-pulse">
      <div className="h-64 bg-surface rounded-3xl max-w-5xl mx-auto mb-10" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        <div className="h-80 bg-surface rounded-3xl" />
        <div className="h-80 bg-surface rounded-3xl" />
        <div className="h-80 bg-surface rounded-3xl" />
      </div>
    </div>
  );
}

export default function BlogPage({ searchParams }: BlogPageProps) {
  return (
    <main id="main-content" className="bg-white min-h-screen">
      {/* 1. Page Header */}
      <PageHeader
        eyebrow="Our Journal"
        title="Dental tips, explained simply."
        description="Clear, evidence-backed guides to everyday oral hygiene, restorative smile care, and pediatric dentistry from our Ahilyanagar specialists."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blog" },
        ]}
      />

      {/* Suspense boundary for Next.js 16 Partial Prerendering */}
      <Suspense fallback={<BlogLoadingFallback />}>
        <BlogContentContainer searchParams={searchParams} />
      </Suspense>

      {/* 4. Journal Newsletter Band */}
      <BlogNewsletterBand />
    </main>
  );
}
