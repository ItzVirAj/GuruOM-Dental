"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Loader2,
  ExternalLink,
  ImageIcon,
  FileText,
  Star,
  Clock,
  Calendar,
} from "lucide-react";
import { VideoFacade } from "@/components/video/VideoFacade";
import {
  MediaPickerModal,
  type SelectedMediaPayload,
} from "@/components/editor/media-picker-modal";
import cloudinaryLoader from "@/src/lib/media/cloudinary-loader";
import {
  updateVideoAction,
  setVideoStatusAction,
  setFeaturedAction,
  setVideoThumbnailAction,
  reimportThumbnailAction,
  trashVideoAction,
} from "@/src/server/owner/videos/actions";

interface EditVideoClientProps {
  initialData: {
    video: {
      id: string;
      youtubeId: string;
      slug: string;
      title: string;
      description: string;
      channelName: string | null;
      categorySlug: string | null;
      thumbnailMediaId: string;
      thumbnailUrl: string;
      thumbnailBlur?: string;
      thumbnailAlt?: string;
      startSeconds: number | null;
      uploadedOn: string | null;
      status: "draft" | "published";
      featured: boolean;
      version: number;
    };
    posts: Array<{
      id: string;
      title: string;
      slug: string;
      status: string;
    }>;
    categories: Array<{
      slug: string;
      label: string;
    }>;
  };
  baseOwnerPath: string;
}

export function EditVideoClient({
  initialData,
  baseOwnerPath,
}: EditVideoClientProps) {
  const router = useRouter();
  const [video, setVideo] = useState(initialData.video);
  const posts = initialData.posts;
  const categories = initialData.categories;

  // Form Fields
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description);
  const [slug, setSlug] = useState(video.slug);
  const [categorySlug, setCategorySlug] = useState(video.categorySlug || "");

  const initialM = video.startSeconds ? Math.floor(video.startSeconds / 60) : 0;
  const initialS = video.startSeconds ? video.startSeconds % 60 : 0;
  const [startMinutes, setStartMinutes] = useState(initialM ? String(initialM) : "");
  const [startSecs, setStartSecs] = useState(initialS ? String(initialS) : "");
  const [uploadedOn, setUploadedOn] = useState(video.uploadedOn || "");

  // Modal & Async Status
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isReimporting, setIsReimporting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSave = () => {
    setErrorMessage(null);
    setConflictError(null);

    let totalStart: number | null = null;
    const m = parseInt(startMinutes || "0", 10);
    const s = parseInt(startSecs || "0", 10);
    if (!isNaN(m) && !isNaN(s) && (m > 0 || s > 0)) {
      totalStart = Math.max(0, Math.min(86399, m * 60 + s));
    }

    startTransition(async () => {
      try {
        const res = await updateVideoAction(
          video.id,
          {
            title: title.trim(),
            description: description.trim(),
            slug: slug.trim(),
            categorySlug: categorySlug || null,
            startSeconds: totalStart,
            uploadedOn: uploadedOn || null,
          },
          video.version
        );

        setVideo((prev) => ({
          ...prev,
          title: title.trim(),
          description: description.trim(),
          slug: res.slug,
          categorySlug: categorySlug || null,
          startSeconds: totalStart,
          uploadedOn: uploadedOn || null,
          version: res.version,
        }));

        showToast("Changes saved successfully.");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed saving video.";
        if (msg.includes("CONFLICT")) {
          setConflictError(msg);
        } else {
          setErrorMessage(msg);
        }
      }
    });
  };

  const handleToggleStatus = (newStatus: "draft" | "published") => {
    startTransition(async () => {
      try {
        const res = await setVideoStatusAction(video.id, newStatus);
        setVideo((prev) => ({
          ...prev,
          status: newStatus,
          version: prev.version + 1,
        }));
        if (res.warningPosts && res.warningPosts.length > 0) {
          showToast(
            `Notice: Unpublished, but video is embedded in ${res.warningPosts.length} post(s).`
          );
        } else {
          showToast(`Status updated to ${newStatus}.`);
        }
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error ? err.message : "Failed updating status."
        );
      }
    });
  };

  const handleToggleFeatured = () => {
    startTransition(async () => {
      try {
        await setFeaturedAction(video.id);
        setVideo((prev) => ({
          ...prev,
          featured: true,
          version: prev.version + 1,
        }));
        showToast("Video set as featured walkthrough.");
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error ? err.message : "Failed setting featured video."
        );
      }
    });
  };

  const handleSelectMediaThumbnail = (mediaItem: SelectedMediaPayload) => {
    startTransition(async () => {
      try {
        await setVideoThumbnailAction(video.id, mediaItem.id);
        setVideo((prev) => ({
          ...prev,
          thumbnailMediaId: mediaItem.id,
          thumbnailUrl: mediaItem.publicId,
        }));
        setIsMediaModalOpen(false);
        showToast("Thumbnail updated from media library.");
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error ? err.message : "Failed setting thumbnail."
        );
      }
    });
  };

  const handleReimportThumbnail = async () => {
    setIsReimporting(true);
    setErrorMessage(null);

    try {
      const res = await reimportThumbnailAction(video.id);
      setVideo((prev) => ({
        ...prev,
        thumbnailMediaId: res.mediaId,
      }));
      showToast("Thumbnail re-imported from YouTube CDN.");
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed re-importing thumbnail."
      );
    } finally {
      setIsReimporting(false);
    }
  };

  const handleMoveToTrash = () => {
    if (!confirm("Are you sure you want to move this video to trash?")) return;
    startTransition(async () => {
      try {
        await trashVideoAction(video.id);
        router.push(`${baseOwnerPath}/videos`);
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error ? err.message : "Failed moving to trash."
        );
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Toast Region */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-ink text-white px-4 py-3 rounded-xl shadow-2xl text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line/60">
        <div className="space-y-1">
          <Link
            href={`${baseOwnerPath}/videos`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Videos Library
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-ink">
              Edit Video: {video.title}
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wider ${
                video.status === "published"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              {video.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {video.status === "published" && (
            <Link
              href={`/videos/${video.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl border border-line bg-white hover:bg-black/5 text-ink text-xs font-medium inline-flex items-center gap-1.5 min-h-[40px]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Live Page
            </Link>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-accent text-white text-xs font-medium transition-all shadow-xs disabled:opacity-40 flex items-center gap-1.5 min-h-[40px] cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {/* Conflict Error Notice */}
      {conflictError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Simultaneous Edit Conflict</span>
          </div>
          <p>{conflictError}</p>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="mt-2 px-3 py-1.5 bg-amber-200 text-amber-900 rounded-lg text-xs font-medium hover:bg-amber-300"
          >
            Reload Latest Changes
          </button>
        </div>
      )}

      {/* Generic Error */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Two Column Layout: Editor Form + Preview & Post Usages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-line shadow-xs space-y-5 text-xs sm:text-sm">
            <h2 className="font-display font-semibold text-base text-ink">
              Video Metadata
            </h2>

            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="edit-title" className="font-medium text-ink block">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="edit-title"
                type="text"
                value={title}
                maxLength={160}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand font-medium"
              />
              <span className="text-[11px] text-ink-muted">
                {title.length}/160 characters
              </span>
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label htmlFor="edit-slug" className="font-medium text-ink block">
                URL Slug
              </label>
              <input
                id="edit-slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand font-mono text-xs"
              />
              <span className="text-[11px] text-ink-muted">
                Public URL: <code>/videos/{slug}</code>
              </span>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="edit-desc" className="font-medium text-ink block">
                Description / Educational Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                id="edit-desc"
                rows={5}
                value={description}
                maxLength={600}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              />
              <span className="text-[11px] text-ink-muted">
                {description.length}/600 characters
              </span>
            </div>

            {/* Topic Category */}
            <div className="space-y-1.5">
              <label htmlFor="edit-cat" className="font-medium text-ink block">
                Clinical Topic
              </label>
              <select
                id="edit-cat"
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand min-h-[44px]"
              >
                <option value="">Select a topic (optional)...</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Time */}
            <div className="space-y-1.5">
              <label className="font-medium text-ink block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-ink-muted" />
                Start Time
              </label>
              <div className="flex items-center gap-2 max-w-xs">
                <input
                  type="number"
                  min="0"
                  max="1440"
                  placeholder="0"
                  value={startMinutes}
                  onChange={(e) => setStartMinutes(e.target.value)}
                  className="w-20 px-3 py-2 text-center rounded-xl border border-line bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                />
                <span className="text-ink-muted font-bold">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="00"
                  value={startSecs}
                  onChange={(e) => setStartSecs(e.target.value)}
                  className="w-20 px-3 py-2 text-center rounded-xl border border-line bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                />
                <span className="text-xs text-ink-muted">(mm : ss)</span>
              </div>
            </div>

            {/* Uploaded On */}
            <div className="space-y-1.5">
              <label htmlFor="edit-date" className="font-medium text-ink block flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-ink-muted" />
                Original Upload Date
              </label>
              <input
                id="edit-date"
                type="date"
                value={uploadedOn}
                onChange={(e) => setUploadedOn(e.target.value)}
                className="max-w-xs px-3.5 py-2 rounded-xl border border-line bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              />
            </div>
          </div>

          {/* Thumbnail Management Card */}
          <div className="p-6 rounded-2xl bg-white border border-line shadow-xs space-y-4 text-xs sm:text-sm">
            <h2 className="font-display font-semibold text-base text-ink">
              Cover Thumbnail
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="relative w-44 aspect-video rounded-xl overflow-hidden bg-ink/90 border border-line shrink-0">
                {video.thumbnailUrl && (
                  <Image
                    loader={cloudinaryLoader}
                    src={video.thumbnailUrl}
                    alt={title}
                    fill
                    sizes="176px"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="space-y-2.5 flex-1">
                <p className="text-xs text-ink-muted leading-relaxed">
                  Video thumbnails are securely hosted on Cloudinary so visitor browsers never query Google or ytimg on page load.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsMediaModalOpen(true)}
                    className="px-3 py-2 rounded-xl border border-line bg-surface hover:bg-black/5 text-ink text-xs font-medium flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Pick from Media Library
                  </button>

                  <button
                    type="button"
                    disabled={isReimporting}
                    onClick={handleReimportThumbnail}
                    className="px-3 py-2 rounded-xl border border-line bg-surface hover:bg-black/5 text-ink text-xs font-medium flex items-center gap-1.5 disabled:opacity-40"
                  >
                    {isReimporting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="w-3.5 h-3.5" />
                    )}
                    Re-import from YouTube
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Publishing & Dangerous Zone */}
          <div className="p-6 rounded-2xl bg-white border border-line shadow-xs space-y-4">
            <h2 className="font-display font-semibold text-base text-ink">
              Publishing Options
            </h2>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleToggleStatus(video.status === "published" ? "draft" : "published")
                  }
                  className={`px-4 py-2 rounded-xl text-xs font-medium border ${
                    video.status === "published"
                      ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                      : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  }`}
                >
                  {video.status === "published" ? "Unpublish to Draft" : "Publish to Live Site"}
                </button>

                {video.status === "published" && (
                  <button
                    type="button"
                    disabled={video.featured}
                    onClick={handleToggleFeatured}
                    className="px-4 py-2 rounded-xl text-xs font-medium border border-line bg-surface hover:bg-black/5 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Star className={`w-3.5 h-3.5 ${video.featured ? "fill-amber-500 text-amber-500" : ""}`} />
                    {video.featured ? "Featured Walkthrough" : "Make Featured"}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleMoveToTrash}
                className="px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                Move to Trash
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Facade Owner Preview & Post References (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Facade Preview Card */}
          <div className="p-6 rounded-2xl bg-white border border-line shadow-xs space-y-4">
            <h2 className="font-display font-semibold text-base text-ink">
              Player Facade Preview
            </h2>
            <p className="text-xs text-ink-muted">
              In the owner portal, administrative CSP restricts iframes; click to test fallback link behavior.
            </p>

            <VideoFacade
              youtubeId={video.youtubeId}
              title={title}
              thumbnail={{ url: video.thumbnailUrl, blur: video.thumbnailBlur }}
              startSeconds={
                parseInt(startMinutes || "0", 10) * 60 +
                parseInt(startSecs || "0", 10)
              }
              isOwnerPreview={true}
            />
          </div>

          {/* Posts referencing this video */}
          <div className="p-6 rounded-2xl bg-white border border-line shadow-xs space-y-4">
            <h2 className="font-display font-semibold text-base text-ink flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand" />
              Used in Posts ({posts.length})
            </h2>

            {posts.length === 0 ? (
              <p className="text-xs text-ink-muted">
                This video is not currently embedded in any articles.
              </p>
            ) : (
              <div className="divide-y divide-line/60">
                {posts.map((p) => (
                  <div
                    key={p.id}
                    className="py-2.5 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-medium text-ink truncate">{p.title}</p>
                      <span className="text-[10px] text-ink-muted uppercase">
                        {p.status}
                      </span>
                    </div>
                    <Link
                      href={`${baseOwnerPath}/posts/${p.id}/edit`}
                      className="text-brand hover:underline shrink-0"
                    >
                      Edit Post →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleSelectMediaThumbnail}
        title="Select Video Thumbnail"
      />
    </div>
  );
}
