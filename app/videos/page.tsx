import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { VideoFacade } from "@/components/video/VideoFacade";
import { VideosGrid } from "@/components/sections/videos/VideosGrid";
import {
  getLiveVideos,
  getFeaturedVideo,
} from "@/src/server/videos/queries";
import { getCategoriesWithCounts } from "@/src/server/blog/queries";
import { siteConfig } from "@/data/site";
import { Container } from "@/components/ui/Container";

interface VideosPageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Clinical Video Library & Patient Demonstrations | GuruOm Dental",
  description:
    "Watch patient education walkthroughs, oral hygiene guides, and advanced clinical dental treatment demonstrations from specialist doctors at GuruOm Dental.",
  openGraph: {
    title: "Clinical Video Library | GuruOm Dental",
    description:
      "Watch dental treatment walkthroughs and specialist oral hygiene guides in privacy-enhanced playback.",
    url: `${siteConfig.url}/videos`,
    siteName: siteConfig.name,
    type: "website",
  },
  alternates: {
    canonical: "/videos",
  },
};

async function VideosContentContainer({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;

  const [categories, featuredVideo, { items: liveVideos, total }] =
    await Promise.all([
      getCategoriesWithCounts(),
      getFeaturedVideo(),
      getLiveVideos({
        category: params.category && params.category !== "all" ? params.category : undefined,
        limit: 12,
      }),
    ]);

  const validCategory = categories.some((c) => c.slug === params.category)
    ? params.category
    : "all";

  // If featured video is present and no filter is active, exclude it from the grid
  const regularVideos =
    featuredVideo && validCategory === "all"
      ? liveVideos.filter((v) => v.id !== featuredVideo.id)
      : liveVideos;

  return (
    <>
      {/* Featured Video Spotlight */}
      {featuredVideo && validCategory === "all" && (
        <section className="py-8 sm:py-12 bg-paper-sunken/40 border-b border-line/60">
          <Container>
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-accent/20 text-accent-dark">
                  Featured Walkthrough
                </span>
              </div>
              <VideoFacade
                youtubeId={featuredVideo.youtubeId}
                title={featuredVideo.title}
                thumbnail={featuredVideo.thumbnail}
                startSeconds={featuredVideo.startSeconds}
              />
              <div className="pt-2">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                  {featuredVideo.title}
                </h2>
                <p className="text-sm text-ink-muted mt-1 leading-relaxed">
                  {featuredVideo.description}
                </p>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Filterable Video Catalog Grid */}
      <VideosGrid
        initialVideos={regularVideos}
        categories={categories}
        initialCategory={validCategory}
        totalCount={total}
      />
    </>
  );
}

function VideosLoadingFallback() {
  return (
    <div className="py-16 text-center animate-pulse max-w-6xl mx-auto px-4">
      <div className="h-64 bg-surface rounded-3xl max-w-4xl mx-auto mb-10" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-72 bg-surface rounded-2xl" />
        <div className="h-72 bg-surface rounded-2xl" />
        <div className="h-72 bg-surface rounded-2xl" />
      </div>
    </div>
  );
}

export default function VideosPage({ searchParams }: VideosPageProps) {
  return (
    <main id="main-content" className="bg-white min-h-screen">
      <PageHeader
        eyebrow="Watch"
        title="Clinical Procedures & Dental Education"
        description="Clear, specialist walkthroughs of advanced treatments, oral hygiene practices, and patient care explanations in privacy-enhanced video mode."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Videos" },
        ]}
      />

      <Suspense fallback={<VideosLoadingFallback />}>
        <VideosContentContainer searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

