import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, User, ArrowRight, Stethoscope, Sparkles } from "lucide-react";
import {
  getLivePostBySlug,
  getRelatedPosts,
  getAdjacentPosts,
  getAllLiveSlugs,
} from "@/src/server/blog/queries";
import { formatDate } from "@/src/lib/blog-format";
import { servicesData } from "@/data/services";
import { siteConfig } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { SmartImage } from "@/components/ui/SmartImage";
import { Button } from "@/components/ui/Button";
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
    return {
      title: "Article Not Found | GuruOm Dental",
    };
  }

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
    <main id="main-content" className="bg-white min-h-screen">
      {/* 1. Article Reading Progress Bar */}
      <BlogProgressBar />

      {/* 2. Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 3. Post Header with Breadcrumbs & Meta Row */}
      <PageHeader
        eyebrow={categoryLabel || "Clinical Journal"}
        title={post.title}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          {
            label: categoryLabel || "Category",
            href: `/blog?category=${post.category}`,
          },
          { label: post.title },
        ]}
      >
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-white/80 pt-2 font-body">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            <span>Published {formattedPublished}</span>
          </span>

          {formattedUpdated && (
            <span className="flex items-center gap-1.5 text-white/60">
              <span>(Updated {formattedUpdated})</span>
            </span>
          )}

          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            <span>{readTime} min read</span>
          </span>

          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            <span>{post.authorName}</span>
          </span>
        </div>
      </PageHeader>

      {/* 4. Article Layout with Main Column and Sticky Sidebar */}
      <div className="py-12 sm:py-16 md:py-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Main Article Column (About 720px on desktop) */}
            <div className="lg:col-span-8 max-w-[740px] w-full mx-auto space-y-8">
              {/* Article Cover Image (16/9) */}
              <div className="rounded-3xl overflow-hidden border border-line bg-surface-alt shadow-card">
                <SmartImage
                  slot={post.coverSlot || undefined}
                  alt={post.title}
                  ratio="16/9"
                  priority={true}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Mobile Table of Contents Disclosure (Hidden on Desktop) */}
              <BlogTableOfContents items={tocItems} isMobileDisclosure={true} />

              {/* Core Semantic Article Content */}
              <article id="article-content" className="prose-content">
                <BlogContent content={post.content} />
              </article>

              {/* Author Box, Medically Reviewed Badge & Clinical Disclaimer */}
              <BlogAuthorBox
                authorName={post.authorName}
                authorRole={post.authorRole}
                reviewedBySlug={post.reviewedBySlug || undefined}
              />

              {/* Mobile Share Block (Shown at the bottom on mobile) */}
              <div className="lg:hidden">
                <BlogShareBlock title={post.title} />
              </div>

              {/* Previous / Next Article Navigation */}
              <BlogPrevNext prev={prev} next={next} />
            </div>

            {/* Desktop Sticky Sidebar (~30-35% width) */}
            <aside
              aria-label="Article navigation and tools"
              className="hidden lg:block lg:col-span-4 sticky top-28 space-y-6"
            >
              {/* Desktop Table of Contents */}
              <BlogTableOfContents items={tocItems} isMobileDisclosure={false} />

              {/* Desktop Share Options */}
              <BlogShareBlock title={post.title} />

              {/* Clinical Appointment Booking Card */}
              <div className="p-6 rounded-3xl bg-brand-dark text-white border border-accent/30 shadow-card space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="font-display font-semibold text-white text-base">
                    Need Direct Consultation?
                  </h4>
                </div>

                <p className="text-xs text-white/75 leading-relaxed font-body">
                  Discuss symptoms or restorative treatment options directly with our specialized
                  clinical team in Ahilyanagar.
                </p>

                <div className="space-y-2 pt-1">
                  <Button
                    href="/appointment"
                    variant="secondary"
                    size="sm"
                    showIcon={false}
                    className="w-full"
                  >
                    <span className="flex items-center gap-1.5">
                      <span>Book Consultation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Button>

                  {relatedService && (
                    <Link
                      href={`/services/${relatedService.slug}`}
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-white/80 hover:text-accent transition-colors"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Learn about {relatedService.title}</span>
                    </Link>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </div>

      {/* 5. Related Articles Grid */}
      <BlogRelatedPosts posts={relatedPosts} />
    </main>
  );
}
