import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { getEnv } from "@/src/lib/env";
import { requireOwner } from "@/src/server/auth/guard";
import { ownerHref } from "@/src/lib/owner-url";
import { OwnerHeader } from "./owner-header";
import { getDb } from "@/src/db/client";
import { posts, media, mediaDeletions, videos } from "@/src/db/schema";
import { sql, eq, and, isNull, gt, asc, desc } from "drizzle-orm";
import { formatUtcToIst, formatRelativeTime } from "@/src/server/owner/posts/timezone";
import { getCloudinaryConfig } from "@/src/lib/env";
import {
  ShieldCheck,
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  Trash2,
  ArrowRight,
  Plus,
  Loader2,
  HardDrive,
  AlertTriangle,
  Video as VideoIcon,
} from "lucide-react";

export const metadata = {
  title: "Owner Dashboard | GuruOm Dental",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

async function DashboardContent() {
  // Guard: requires authenticated owner with verified 2FA and under 12h session
  const { user: owner } = await requireOwner();

  const db = getDb();
  if (!db) {
    throw new Error("Database unconfigured.");
  }

  const now = new Date();

  // 1. Post counts
  const countsSql = await db.execute(sql`
    SELECT
      COUNT(*) FILTER (WHERE deleted_at IS NULL AND (status = 'published' OR (status = 'scheduled' AND publish_at <= ${now}))) as published_count,
      COUNT(*) FILTER (WHERE deleted_at IS NULL AND status = 'scheduled' AND publish_at > ${now}) as scheduled_count,
      COUNT(*) FILTER (WHERE deleted_at IS NULL AND status = 'draft') as draft_count,
      COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as trash_count
    FROM posts
  `);
  const countsRow = countsSql.rows[0] as Record<string, unknown> | undefined;
  const counts = {
    published: Number(countsRow?.published_count ?? 0),
    scheduled: Number(countsRow?.scheduled_count ?? 0),
    draft: Number(countsRow?.draft_count ?? 0),
    trash: Number(countsRow?.trash_count ?? 0),
  };

  // 2. Next scheduled post
  const nextScheduledRows = await db
    .select({
      id: posts.id,
      title: posts.title,
      publishAt: posts.publishAt,
    })
    .from(posts)
    .where(and(isNull(posts.deletedAt), eq(posts.status, "scheduled"), gt(posts.publishAt, now)))
    .orderBy(asc(posts.publishAt))
    .limit(1);
  const nextScheduled = nextScheduledRows[0] || null;

  // 3. Last 5 edited posts
  const recentPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      status: posts.status,
      publishAt: posts.publishAt,
      updatedAt: posts.updatedAt,
      deletedAt: posts.deletedAt,
    })
    .from(posts)
    .orderBy(desc(posts.updatedAt))
    .limit(5);

  // 4. Media Storage & Failed Deletions Summary
  const [mediaStorageRow] = await db
    .select({
      totalBytes: sql<string>`coalesce(sum(${media.bytes}), 0)`,
      totalCount: sql<number>`count(*)::int`,
    })
    .from(media)
    .where(isNull(media.deletedAt));

  const [failedDeletionsRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(mediaDeletions);

  const mediaBytes = Number(mediaStorageRow?.totalBytes || 0);
  const mediaCount = Number(mediaStorageRow?.totalCount || 0);
  const failedDeletionsCount = Number(failedDeletionsRow?.count || 0);
  const config = getCloudinaryConfig();
  const storageCapBytes = config.mediaLibraryMaxBytes;

  // 5. Video counts and recently modified videos
  const [videoCountsRow] = await db
    .select({
      published: sql<number>`count(*) filter (where ${videos.status} = 'published' and ${videos.deletedAt} is null)::int`,
      draft: sql<number>`count(*) filter (where ${videos.status} = 'draft' and ${videos.deletedAt} is null)::int`,
    })
    .from(videos);

  const videoCounts = {
    published: Number(videoCountsRow?.published ?? 0),
    draft: Number(videoCountsRow?.draft ?? 0),
  };

  const recentVideos = await db
    .select({
      id: videos.id,
      title: videos.title,
      status: videos.status,
      updatedAt: videos.updatedAt,
    })
    .from(videos)
    .where(isNull(videos.deletedAt))
    .orderBy(desc(videos.updatedAt))
    .limit(4);

  return (
    <>
      <OwnerHeader ownerEmail={owner.email} />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 font-body">
        {/* Cloudinary Configuration Pending Notice */}
        {!config.isConfigured && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 text-xs text-amber-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">
                  Cloudinary storage configuration incomplete
                </p>
                <p className="text-amber-800/80 mt-0.5">
                  Set <code className="font-mono bg-amber-500/15 px-1 py-0.5 rounded">CLOUDINARY_API_SECRET</code> in <code className="font-mono bg-amber-500/15 px-1 py-0.5 rounded">.env.local</code> to enable image uploads and storage sync.
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Failed Deletions Alert */}
        {failedDeletionsCount > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 text-xs text-red-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-red-800">
                  {failedDeletionsCount} queued Cloudinary deletion(s) pending retry
                </p>
                <p className="text-red-700/80 mt-0.5">
                  Assets queued for deletion will be retried automatically by the maintenance cron.
                </p>
              </div>
            </div>
            <Link
              href={ownerHref("/media")}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition-colors shrink-0"
            >
              View Media
            </Link>
          </div>
        )}

        {/* Welcome & Security Banner */}
        <div className="bg-white border border-line rounded-3xl p-6 sm:p-8 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal/10 text-teal border border-teal/20 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Two-Factor Authenticated</span>
            </div>
            <h2 className="font-display font-bold text-ink text-2xl">
              Welcome back, {owner.name}
            </h2>
            <p className="text-xs text-ink-muted max-w-xl">
              Owner administration active. All mutations are restricted to your verified 2FA role and audited.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={ownerHref("/posts")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-white font-semibold text-xs shadow-sm hover:bg-brand-dark transition-colors min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Manage Posts</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Card: Published */}
          <Link
            href={ownerHref("/posts?tab=published")}
            className="bg-white border border-line rounded-2xl p-5 shadow-xs hover:border-brand/40 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-ink-muted">Published Posts</span>
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <p className="text-3xl font-display font-bold text-ink">{counts.published}</p>
            <span className="text-[11px] text-emerald-700 font-medium mt-1 block">Live on website</span>
          </Link>

          {/* Card: Scheduled */}
          <Link
            href={ownerHref("/posts?tab=scheduled")}
            className="bg-white border border-line rounded-2xl p-5 shadow-xs hover:border-brand/40 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-ink-muted">Scheduled Posts</span>
              <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <p className="text-3xl font-display font-bold text-ink">{counts.scheduled}</p>
            <span className="text-[11px] text-amber-700 font-medium mt-1 block">Upcoming in IST</span>
          </Link>

          {/* Card: Drafts */}
          <Link
            href={ownerHref("/posts?tab=draft")}
            className="bg-white border border-line rounded-2xl p-5 shadow-xs hover:border-brand/40 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-ink-muted">Post Drafts</span>
              <span className="p-2 rounded-xl bg-zinc-100 text-zinc-700">
                <FileText className="w-4 h-4" />
              </span>
            </div>
            <p className="text-3xl font-display font-bold text-ink">{counts.draft}</p>
            <span className="text-[11px] text-zinc-600 font-medium mt-1 block">In progress</span>
          </Link>

          {/* Card: Videos */}
          <Link
            href={ownerHref("/videos")}
            className="bg-white border border-line rounded-2xl p-5 shadow-xs hover:border-brand/40 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-ink-muted">Video Library</span>
              <span className="p-2 rounded-xl bg-brand/10 text-brand">
                <VideoIcon className="w-4 h-4" />
              </span>
            </div>
            <p className="text-3xl font-display font-bold text-ink">
              {videoCounts.published}{" "}
              <span className="text-xs font-normal text-ink-muted">
                live / {videoCounts.draft} draft{videoCounts.draft === 1 ? "" : "s"}
              </span>
            </p>
            <span className="text-[11px] text-brand font-medium mt-1 block">
              Manage YouTube embeds
            </span>
          </Link>

          {/* Card: Media Library Storage */}
          <Link
            href={ownerHref("/media")}
            className="bg-white border border-line rounded-2xl p-5 shadow-xs hover:border-brand/40 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-ink-muted">Media Library</span>
              <span className="p-2 rounded-xl bg-teal/10 text-teal">
                <HardDrive className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-display font-bold text-ink">
              {(mediaBytes / (1024 * 1024)).toFixed(1)}{" "}
              <span className="text-xs font-normal text-ink-muted">
                / {(storageCapBytes / (1024 * 1024)).toFixed(0)} MB
              </span>
            </p>
            <span className="text-[11px] text-teal font-medium mt-1 block">
              {mediaCount} asset{mediaCount === 1 ? "" : "s"} stored
            </span>
          </Link>

          {/* Card: Trash */}
          <Link
            href={ownerHref("/posts?tab=trash")}
            className="bg-white border border-line rounded-2xl p-5 shadow-xs hover:border-brand/40 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-ink-muted">Post Trash</span>
              <span className="p-2 rounded-xl bg-rose-50 text-rose-700">
                <Trash2 className="w-4 h-4" />
              </span>
            </div>
            <p className="text-3xl font-display font-bold text-ink">{counts.trash}</p>
            <span className="text-[11px] text-rose-600 font-medium mt-1 block">Soft deleted</span>
          </Link>
        </div>

        {/* Next Scheduled Publication Box */}
        {nextScheduled && nextScheduled.publishAt && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>Next Scheduled Publication</span>
              </span>
              <h3 className="font-display font-bold text-base text-ink">
                {nextScheduled.title}
              </h3>
              <p className="text-xs text-amber-800">
                Will publish automatically on{" "}
                <span className="font-bold">{formatUtcToIst(nextScheduled.publishAt)}</span> (
                {formatRelativeTime(nextScheduled.publishAt)})
              </p>
            </div>
            <Link
              href={ownerHref(`/posts/${nextScheduled.id}/edit`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-amber-900 border border-amber-300 font-semibold text-xs hover:bg-amber-50 transition-colors min-h-[44px]"
            >
              <span>Edit Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Recently Modified Articles */}
        <div className="bg-white border border-line rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-ink">Recently Edited Posts</h3>
              <p className="text-xs text-ink-muted">Last 5 updated clinical articles</p>
            </div>
            <Link
              href={ownerHref("/posts")}
              className="text-xs font-semibold text-brand hover:underline inline-flex items-center gap-1 min-h-[44px]"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-line">
            {recentPosts.map((post) => {
              const updatedAtIst = formatUtcToIst(post.updatedAt);
              return (
                <div
                  key={post.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <Link
                      href={ownerHref(`/posts/${post.id}/edit`)}
                      className="font-bold text-sm text-ink hover:text-brand transition-colors block leading-tight"
                    >
                      {post.title}
                    </Link>
                    <div className="flex items-center gap-2 text-[11px] text-ink-muted">
                      <span className="capitalize font-semibold">{post.status}</span>
                      <span>•</span>
                      <span>Updated {updatedAtIst}</span>
                    </div>
                  </div>

                  <Link
                    href={ownerHref(`/posts/${post.id}/edit`)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-brand self-start sm:self-auto min-h-[44px]"
                  >
                    <span>Edit</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recently Added Videos */}
        <div className="bg-white border border-line rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-ink">Recently Added Videos</h3>
              <p className="text-xs text-ink-muted">Latest YouTube walkthroughs and clinical demos</p>
            </div>
            <Link
              href={ownerHref("/videos")}
              className="text-xs font-semibold text-brand hover:underline inline-flex items-center gap-1 min-h-[44px]"
            >
              <span>View all videos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentVideos.length === 0 ? (
            <p className="text-xs text-ink-muted py-4 text-center">
              No videos added yet.{" "}
              <Link href={ownerHref("/videos/new")} className="text-brand hover:underline font-medium">
                Add your first YouTube video
              </Link>
            </p>
          ) : (
            <div className="divide-y divide-line">
              {recentVideos.map((v) => (
                <div
                  key={v.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <Link
                      href={ownerHref(`/videos/${v.id}/edit`)}
                      className="font-bold text-sm text-ink hover:text-brand transition-colors block leading-tight"
                    >
                      {v.title}
                    </Link>
                    <div className="flex items-center gap-2 text-[11px] text-ink-muted">
                      <span className="capitalize font-semibold">{v.status}</span>
                      <span>•</span>
                      <span>Updated {formatUtcToIst(v.updatedAt)}</span>
                    </div>
                  </div>

                  <Link
                    href={ownerHref(`/videos/${v.id}/edit`)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-brand self-start sm:self-auto min-h-[44px]"
                  >
                    <span>Edit</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function DashboardFallback() {
  return (
    <div className="flex-1 flex items-center justify-center py-20 text-ink-muted text-xs gap-2">
      <Loader2 className="w-4 h-4 animate-spin text-brand" />
      <span>Loading owner post metrics &amp; session status...</span>
    </div>
  );
}

export default function OwnerDashboardPage() {
  const env = getEnv();
  if (env.OWNER_AREA_ENABLED !== "true") {
    notFound();
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-surface">
      <Suspense fallback={<DashboardFallback />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
