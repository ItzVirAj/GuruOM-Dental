import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Play, Calendar, Tag, ArrowLeft } from "lucide-react";
import {
  getLiveVideoBySlug,
  getRelatedVideos,
  getAllLiveVideoSlugs,
} from "@/src/server/videos/queries";
import { VideoFacade } from "@/components/video/VideoFacade";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { siteConfig } from "@/data/site";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import { VideoShareBlock } from "./video-share-block";

interface VideoPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = await getAllLiveVideoSlugs();
  if (slugs.length === 0) {
    return [{ slug: "_placeholder" }];
  }
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: VideoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const video = await getLiveVideoBySlug(slug);

  if (!video) {
    return {
      title: "Video Not Found | GuruOm Dental",
    };
  }

  const ogImageUrl = video.thumbnail?.url || `${siteConfig.url}/images/og-default.jpg`;

  return {
    title: `${video.title} | GuruOm Dental Video Library`,
    description: video.description,
    openGraph: {
      title: video.title,
      description: video.description,
      type: "video.other",
      url: `${siteConfig.url}/videos/${video.slug}`,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImageUrl,
          width: video.thumbnail?.width || 1200,
          height: video.thumbnail?.height || 675,
          alt: video.title,
        },
      ],
    },
    alternates: {
      canonical: `/videos/${video.slug}`,
    },
  };
}

export interface VideoJsonLdInput {
  title?: string | null;
  description?: string | null;
  thumbnail?: { url: string } | null;
  uploadedOn?: string | null;
  youtubeId: string;
}

export function buildVideoJsonLd(video: VideoJsonLdInput) {
  const hasValidVideoObject = Boolean(
    video.title &&
      video.description &&
      video.thumbnail?.url &&
      video.uploadedOn
  );

  if (!hasValidVideoObject) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title!,
    description: video.description!,
    thumbnailUrl: [video.thumbnail!.url],
    uploadDate: video.uploadedOn!,
    embedUrl: `https://www.youtube-nocookie.com/embed/${video.youtubeId}`,
  };
}

export default async function VideoDetailPage({ params }: VideoPageProps) {
  const { slug } = await params;
  const video = await getLiveVideoBySlug(slug);

  if (!video) {
    notFound();
  }

  const relatedVideos = await getRelatedVideos({
    videoId: video.id,
    categorySlug: video.categorySlug,
    limit: 3,
  });

  // VideoObject JSON-LD ONLY when name, description, thumbnailUrl, AND uploadedOn all exist
  const videoJsonLd = buildVideoJsonLd(video);

  return (
    <main id="main-content" className="bg-white min-h-screen">
      {videoJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
        />
      )}

      {/* Page Header */}
      <PageHeader
        eyebrow="Clinical Video"
        title={video.title}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Videos", href: "/videos" },
          { label: video.title },
        ]}
      />

      <div className="py-10 sm:py-14">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Primary Video Player Column */}
            <div className="lg:col-span-8 max-w-[800px] w-full mx-auto space-y-6">
              {/* Back to Library Link */}
              <Link
                href="/videos"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-brand transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to all videos
              </Link>

              {/* The Player (VideoFacade) */}
              <VideoFacade
                youtubeId={video.youtubeId}
                title={video.title}
                thumbnail={video.thumbnail}
                startSeconds={video.startSeconds}
              />

              {/* Video Metadata Header */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-wrap items-center gap-3">
                  {video.categoryLabel && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand/10 text-brand">
                      <Tag className="w-3 h-3" />
                      {video.categoryLabel}
                    </span>
                  )}
                  {video.uploadedOn && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
                      <Calendar className="w-3 h-3 text-ink-muted/70" />
                      Published on {video.uploadedOn}
                    </span>
                  )}
                </div>

                <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                  {video.title}
                </h1>

                <div className="p-6 rounded-2xl bg-surface border border-line space-y-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    About this walkthrough
                  </h2>
                  <p className="text-sm sm:text-base text-ink leading-relaxed font-body whitespace-pre-line">
                    {video.description}
                  </p>
                </div>
              </div>

              {/* Mobile Share Block */}
              <div className="lg:hidden pt-4">
                <VideoShareBlock title={video.title} />
              </div>
            </div>

            {/* Sidebar Column: Share & Related Videos */}
            <aside
              aria-label="Video resources and related procedures"
              className="hidden lg:block lg:col-span-4 sticky top-28 space-y-6"
            >
              {/* Share Block */}
              <VideoShareBlock title={video.title} />

              {/* Related Videos List */}
              {relatedVideos.length > 0 && (
                <div className="p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-4">
                  <h3 className="font-display font-semibold text-sm text-ink uppercase tracking-wider pb-2 border-b border-line/60">
                    Related Walkthroughs
                  </h3>
                  <div className="space-y-4">
                    {relatedVideos.map((rv) => (
                      <Link
                        key={rv.id}
                        href={`/videos/${rv.slug}`}
                        className="group flex gap-3 items-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-xl p-1"
                      >
                        <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-ink/90 shrink-0">
                          {rv.thumbnail?.url ? (
                            <CloudinaryImage
                              src={rv.thumbnail.url}
                              alt={rv.title}
                              fill
                              sizes="96px"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-ink">
                              <Play className="w-4 h-4 text-white/40" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Play className="w-4 h-4 fill-white text-white drop-shadow" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-semibold text-ink group-hover:text-brand transition-colors line-clamp-2">
                            {rv.title}
                          </h4>
                          {rv.categoryLabel && (
                            <span className="text-[11px] text-ink-muted mt-1 inline-block">
                              {rv.categoryLabel}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </Container>
      </div>
    </main>
  );
}
