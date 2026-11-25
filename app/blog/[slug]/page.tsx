import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, User, Stethoscope } from "lucide-react";
import { coverUrl } from "@/src/lib/media/cloudinary-loader";
import {
  getLivePostBySlug,
  getRelatedPosts,
  getAdjacentPosts,
  getAllLiveSlugs,
  getHistoricalSlugRedirect,
} from "@/src/server/blog/queries";
import { formatDate } from "@/src/lib/blog-format";
import { servicesData } from "@/data/services";
import { siteConfig } from "@/data/site";
import { Container } from "@/components/ui/Container";
import {
  BlogProgressBar,
  BlogTableOfContents,
  BlogShareBlock,
  BlogContent,
  TocItem,
  BlogAuthorBox,
  BlogPrevNext,
  BlogRelatedPosts,
} from "@/components/sections/blog";

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const instant = false;

export async function generateStaticParams() {
  const slugs = await getAllLiveSlugs();
  if (slugs.length === 0) {
    // Next.js 16 cacheComponents requires generateStaticParams to return >= 1 item for build validation
    return [{ slug: "_placeholder" }];
  }
  return slugs.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getLivePostBySlug(slug);

  if (!post) {
    const historicalSlug = await getHistoricalSlugRedirect(slug);
    if (historicalSlug) {
      permanentRedirect(`/blog/${historicalSlug}`);
    }
    return {
      title: "Article Not Found | GuruOm Dental",
    };
  }

  const ogImageUrl = post.coverMedia
    ? coverUrl(post.coverMedia, "og")
    : `${siteConfig.url}/images/og-default.jpg`;

  return {
    title: `${post.title} | GuruOm Dental Journal`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: [post.authorName],
      tags: post.tags,
      url: `${siteConfig.url}/blog/${post.slug}`,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.coverAltOverride || post.coverMedia?.alt || post.title,
        },
      ],
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getLivePostBySlug(slug);

  if (!post) {
    const historicalSlug = await getHistoricalSlugRedirect(slug);
    if (historicalSlug) {
      permanentRedirect(`/blog/${historicalSlug}`);
    }
    notFound();
  }

  const categoryLabel = post.categoryLabel || post.category;
  const formattedPublished = formatDate(post.publishedAt);
  const formattedUpdated = post.updatedAt ? formatDate(post.updatedAt) : undefined;
  const readTime = post.readingTimeMinutes || 5;

  const [relatedPosts, { prev, next }] = await Promise.all([
    getRelatedPosts(post.slug, 3),
    getAdjacentPosts(post.slug),
  ]);

  const relatedService = post.relatedServiceSlug
    ? servicesData.find((s) => s.slug === post.relatedServiceSlug)
    : undefined;

  // Extract H2 and H3 items for Table of Contents
  const tocItems: TocItem[] = post.content
    .filter((b) => b.type === "heading")
    .map((b) => {
      const headingBlock = b as {
        type: "heading";
        level: 2 | 3;
        text?: string;
        runs?: Array<{ text: string }>;
        id?: string;
      };
      const rawText =
        headingBlock.text ||
        headingBlock.runs?.map((r) => r.text).join("") ||
        "";
      const generatedId =
        headingBlock.id ||
        rawText
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "") ||
        "section";
      return {
        id: generatedId,
        text: rawText,
        level: headingBlock.level,
      };
    });

  // Schema.org BlogPosting structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      "@type": "Person",
      name: post.authorName,
      jobTitle: post.authorRole,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/blog/${post.slug}`,
    },
    keywords: post.tags.join(", "),
  };

  return (
    <main id="main-content" className="bg-white min-h-screen font-aileron text-ink">
      {/* 1. Thin Reading Progress Hairline */}
      <BlogProgressBar />

      {/* 2. Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 3. Editorial Monograph Header Band */}
      <header className="relative bg-surface border-b border-line pt-[calc(var(--nav-h,5rem)+2.25rem)] pb-10 sm:pb-14">
        <Container>
          <div className="max-w-5xl">
            {/* Quiet Breadcrumb Path */}
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                <li>
                  <Link href="/" className="hover:text-ink transition-colors">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true" className="text-line">/</li>
                <li>
                  <Link href="/blog" className="hover:text-ink transition-colors">
                    Journal
                  </Link>
                </li>
                <li aria-hidden="true" className="text-line">/</li>
                <li>
                  <Link
                    href={`/blog?category=${post.category}`}
                    className="hover:text-ink transition-colors"
                  >
                    {categoryLabel || "General"}
                  </Link>
                </li>
              </ol>
            </nav>

            {/* Category Indicator */}
            <div className="flex items-center gap-2.5 text-sm font-medium text-ink-muted mb-4">
              <span className="h-2 w-2 rounded-full bg-accent shrink-0" aria-hidden="true" />
              <span>{categoryLabel || "Clinical Journal"}</span>
            </div>

            {/* Expressive Headline */}
            <h1 className="font-just-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-normal leading-[1.06] tracking-[-0.025em] text-brand-dark text-balance max-w-4xl">
              {post.title}
            </h1>

            {/* Editorial Lede */}
            {post.excerpt && (
              <p className="mt-5 text-base sm:text-xl text-ink-muted leading-relaxed max-w-[62ch] font-body">
                {post.excerpt}
              </p>
            )}

            {/* Metadata Hairline Row */}
            <div className="mt-8 pt-6 border-t border-line flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-ink-muted">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <span className="inline-flex items-center gap-2 text-ink font-medium">
                  <User className="w-4 h-4 text-accent-deep shrink-0" aria-hidden="true" />
                  <span>{post.authorName}</span>
                </span>

                <span className="inline-flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
                  <span>Published {formattedPublished}</span>
                  {formattedUpdated && formattedUpdated !== formattedPublished && (
                    <span className="text-ink-muted/80">(Updated {formattedUpdated})</span>
                  )}
                </span>

                <span className="inline-flex items-center gap-2">
                  <Clock className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
                  <span>{readTime} min read</span>
                </span>
              </div>

              {post.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {post.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-md border border-line bg-white text-xs text-ink-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Container>
      </header>

      {/* 4. Reading Architecture */}
      <div className="py-10 sm:py-14 lg:py-16">
        <Container>
          {/* Reading Spread: Prose Column + Quiet Sticky Rail */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Main Editorial Prose (strictly comfortable reading measure <=68ch) */}
            <div className="lg:col-span-8 max-w-[68ch] w-full space-y-10">
              <BlogTableOfContents items={tocItems} isMobileDisclosure={true} />

              <article id="article-content">
                <BlogContent
                  content={post.content}
                  resolvedMediaMap={post.resolvedMediaMap}
                  resolvedVideosMap={post.resolvedVideosMap}
                />
              </article>

              <BlogAuthorBox
                authorName={post.authorName}
                authorRole={post.authorRole}
                reviewedBySlug={post.reviewedBySlug || undefined}
              />

              <div className="lg:hidden">
                <BlogShareBlock title={post.title} />
              </div>

              <BlogPrevNext prev={prev} next={next} />
            </div>

            {/* Sticky Margin Rail */}
            <aside
              aria-label="Article navigation and clinic contact"
              className="hidden lg:block lg:col-span-4 sticky top-28 lg:border-l lg:border-line lg:pl-10 space-y-10"
            >
              <BlogTableOfContents items={tocItems} isMobileDisclosure={false} />

              <BlogShareBlock title={post.title} />

              {/* Single Dark Espresso Anchor Callout */}
              <div className="p-6 rounded-xl bg-brand-dark text-white space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-accent shrink-0" aria-hidden="true" />
                  <h4 className="font-just-serif text-xl font-normal text-white">
                    Discuss this with our clinic
                  </h4>
                </div>

                <p className="text-sm text-white/75 leading-relaxed font-body">
                  Speak with our clinical specialists in Ahilyanagar about symptoms, scans, or restorative care.
                </p>

                <div className="space-y-2.5 pt-1">
                  <Link
                    href="/contact"
                    className="inline-flex w-full items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent hover:bg-white transition-colors"
                  >
                    Contact the clinic
                  </Link>

                  {relatedService && (
                    <Link
                      href={`/services/${relatedService.slug}`}
                      className="inline-flex items-center justify-center gap-2 w-full py-1.5 text-xs font-medium text-white/80 hover:text-accent transition-colors"
                    >
                      <Stethoscope className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Explore {relatedService.title}</span>
                    </Link>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </div>

      {/* 5. Related Articles Shelf */}
      <BlogRelatedPosts posts={relatedPosts} />
    </main>
  );
}
