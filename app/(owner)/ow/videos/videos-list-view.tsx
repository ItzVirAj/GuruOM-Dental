"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Star,
  ArrowUp,
  ArrowDown,
  Trash2,
  RotateCcw,
  ExternalLink,
  Edit2,
  Video as VideoIcon,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import type { OwnerVideoItem } from "@/src/server/owner/videos/queries";
import { formatUtcToIst } from "@/src/server/owner/posts/timezone";
import cloudinaryLoader from "@/src/lib/media/cloudinary-loader";
import {
  setVideoStatusAction,
  setFeaturedAction,
  reorderVideosAction,
  trashVideoAction,
  restoreVideoAction,
  deleteVideoPermanentlyAction,
} from "@/src/server/owner/videos/actions";

interface VideosListViewProps {
  initialVideos: OwnerVideoItem[];
  baseOwnerPath: string;
}

export function VideosListView({
  initialVideos,
  baseOwnerPath,
}: VideosListViewProps) {
  const [videos, setVideos] = useState<OwnerVideoItem[]>(initialVideos);
  const [activeTab, setActiveTab] = useState<"published" | "draft" | "trash">("published");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Permanent Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<OwnerVideoItem | null>(null);
  const [typedConfirmation, setTypedConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Derive categories for filter
  const categoryOptions = useMemo(() => {
    const map = new Map<string, string>();
    videos.forEach((v) => {
      if (v.categorySlug && v.categoryLabel) {
        map.set(v.categorySlug, v.categoryLabel);
      }
    });
    return Array.from(map.entries()).map(([slug, label]) => ({ slug, label }));
  }, [videos]);

  // Tab counts
  const publishedCount = videos.filter((v) => !v.deletedAt && v.status === "published").length;
  const draftCount = videos.filter((v) => !v.deletedAt && v.status === "draft").length;
  const trashCount = videos.filter((v) => Boolean(v.deletedAt)).length;

  // Filtered list
  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      // Tab matching
      if (activeTab === "trash") {
        if (!v.deletedAt) return false;
      } else if (activeTab === "published") {
        if (v.deletedAt || v.status !== "published") return false;
      } else {
        if (v.deletedAt || v.status !== "draft") return false;
      }

      // Search matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = v.title.toLowerCase().includes(q);
        const matchChannel = v.channelName?.toLowerCase().includes(q);
        const matchSlug = v.slug.toLowerCase().includes(q);
        if (!matchTitle && !matchChannel && !matchSlug) return false;
      }

      // Category matching
      if (categoryFilter !== "all") {
        if (v.categorySlug !== categoryFilter) return false;
      }

      return true;
    });
  }, [videos, activeTab, searchQuery, categoryFilter]);

  // Actions
  const handleToggleStatus = (id: string, currentStatus: "draft" | "published") => {
    const nextStatus = currentStatus === "published" ? "draft" : "published";
    startTransition(async () => {
      try {
        const res = await setVideoStatusAction(id, nextStatus);
        setVideos((prev) =>
          prev.map((v) => (v.id === id ? { ...v, status: nextStatus, updatedAt: new Date() } : v))
        );
        if (res.warningPosts && res.warningPosts.length > 0) {
          showToast(
            `Notice: Video was unpublished, but it is currently embedded in ${res.warningPosts.length} posts.`
          );
        } else {
          showToast(`Video status updated to ${nextStatus}.`);
        }
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : "Failed updating video status");
      }
    });
  };

  const handleToggleFeatured = (id: string) => {
    startTransition(async () => {
      try {
        await setFeaturedAction(id);
        setVideos((prev) =>
          prev.map((v) => ({
            ...v,
            featured: v.id === id,
            updatedAt: v.id === id ? new Date() : v.updatedAt,
          }))
        );
        showToast("Featured video updated.");
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : "Failed setting featured video");
      }
    });
  };

  const handleMoveOrder = (index: number, direction: "up" | "down") => {
    if (activeTab === "trash") return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredVideos.length) return;

    const listCopy = [...filteredVideos];
    const temp = listCopy[index];
    listCopy[index] = listCopy[targetIndex];
    listCopy[targetIndex] = temp;

    const orderedIds = listCopy.map((v) => v.id);

    startTransition(async () => {
      try {
        await reorderVideosAction(orderedIds);
        setVideos((prev) => {
          const map = new Map(orderedIds.map((id, idx) => [id, idx + 1]));
          return [...prev].sort((a, b) => {
            const orderA = map.get(a.id) ?? a.sortOrder;
            const orderB = map.get(b.id) ?? b.sortOrder;
            return orderA - orderB;
          });
        });
        showToast("Video order saved.");
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : "Failed reordering videos");
      }
    });
  };

  const handleTrash = (id: string) => {
    startTransition(async () => {
      try {
        const res = await trashVideoAction(id);
        setVideos((prev) =>
          prev.map((v) =>
            v.id === id ? { ...v, deletedAt: new Date(), featured: false } : v
          )
        );
        if (res.warningPosts && res.warningPosts.length > 0) {
          showToast(
            `Moved to Trash. Warning: Embedded in ${res.warningPosts.length} post(s).`
          );
        } else {
          showToast("Video moved to trash.");
        }
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : "Failed moving video to trash");
      }
    });
  };

  const handleRestore = (id: string) => {
    startTransition(async () => {
      try {
        await restoreVideoAction(id);
        setVideos((prev) =>
          prev.map((v) =>
            v.id === id ? { ...v, deletedAt: null, status: "draft" } : v
          )
        );
        showToast("Video restored as draft.");
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : "Failed restoring video");
      }
    });
  };

  const handleConfirmPermanentDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);

    startTransition(async () => {
      try {
        await deleteVideoPermanentlyAction(deleteTarget.id, typedConfirmation);
        setVideos((prev) => prev.filter((v) => v.id !== deleteTarget.id));
        setDeleteTarget(null);
        setTypedConfirmation("");
        showToast("Video permanently deleted.");
      } catch (err: unknown) {
        setDeleteError(
          err instanceof Error ? err.message : "Failed permanent deletion."
        );
      }
    });
  };

  return (
    <div className="space-y-6">
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

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            Video Walkthroughs
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1 font-body">
            Manage privacy-friendly YouTube embeds, categories, and cover thumbnails.
          </p>
        </div>

        <Link
          href={`${baseOwnerPath}/videos/new`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-brand hover:bg-brand-accent text-white text-xs sm:text-sm font-medium shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          Add Video
        </Link>
      </div>

      {/* Segmented Tab Bar */}
      <div className="flex items-center gap-2 border-b border-black/[0.08] pb-px">
        <button
          type="button"
          onClick={() => setActiveTab("published")}
          className={`px-4 py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 -mb-px min-h-[44px] flex items-center gap-1.5 ${
            activeTab === "published"
              ? "border-brand text-brand font-semibold"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          Published
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/[0.05]">
            {publishedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("draft")}
          className={`px-4 py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 -mb-px min-h-[44px] flex items-center gap-1.5 ${
            activeTab === "draft"
              ? "border-brand text-brand font-semibold"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          Drafts
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/[0.05]">
            {draftCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("trash")}
          className={`px-4 py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 -mb-px min-h-[44px] flex items-center gap-1.5 ${
            activeTab === "trash"
              ? "border-brand text-brand font-semibold"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          Trash
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/[0.05]">
            {trashCount}
          </span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface p-3 rounded-2xl border border-line">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or channel..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-line bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="cat-filter" className="text-xs text-ink-muted shrink-0">
            Topic:
          </label>
          <select
            id="cat-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-line bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand min-h-[40px]"
          >
            <option value="all">All Topics</option>
            {categoryOptions.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Videos List Table */}
      <div className="rounded-2xl border border-line bg-white overflow-hidden shadow-xs">
        {filteredVideos.length === 0 ? (
          <div className="py-16 text-center text-ink-muted space-y-2">
            <VideoIcon className="w-10 h-10 mx-auto text-ink-muted/40" />
            <p className="text-sm font-medium">No videos found in this view.</p>
            {activeTab !== "trash" && (
              <Link
                href={`${baseOwnerPath}/videos/new`}
                className="text-xs text-brand font-medium hover:underline inline-block mt-1"
              >
                + Add your first video
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-line/60 bg-paper-sunken/40 text-ink-muted font-medium text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">Order</th>
                  <th className="py-3 px-4 w-28">Preview</th>
                  <th className="py-3 px-4">Video Details</th>
                  <th className="py-3 px-4">Topic</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Updated (IST)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {filteredVideos.map((v, idx) => (
                  <tr
                    key={v.id}
                    className="hover:bg-black/[0.015] transition-colors group"
                  >
                    {/* Reorder Buttons */}
                    <td className="py-3 px-4 text-center">
                      {activeTab !== "trash" ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(idx, "up")}
                            disabled={idx === 0 || isPending}
                            aria-label={`Move ${v.title} up`}
                            className="p-1 rounded hover:bg-black/5 disabled:opacity-20 text-ink-muted hover:text-ink transition-colors"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(idx, "down")}
                            disabled={idx === filteredVideos.length - 1 || isPending}
                            aria-label={`Move ${v.title} down`}
                            className="p-1 rounded hover:bg-black/5 disabled:opacity-20 text-ink-muted hover:text-ink transition-colors"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-ink-muted text-xs">—</span>
                      )}
                    </td>

                    {/* Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="relative w-20 sm:w-24 aspect-video rounded-lg overflow-hidden bg-ink/90 border border-line shrink-0">
                        {v.thumbnailUrl ? (
                          <Image
                            loader={cloudinaryLoader}
                            src={v.thumbnailUrl}
                            alt={v.title}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <VideoIcon className="w-4 h-4 text-white/40" />
                          </div>
                        )}
                        {v.featured && (
                          <div className="absolute top-1 left-1 p-0.5 bg-amber-500 rounded-full text-white shadow">
                            <Star className="w-2.5 h-2.5 fill-current" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Title & Info */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <Link
                          href={`${baseOwnerPath}/videos/${v.id}/edit`}
                          className="font-medium text-ink hover:text-brand transition-colors line-clamp-1 block"
                        >
                          {v.title}
                        </Link>
                        <div className="flex items-center gap-2 text-[11px] text-ink-muted">
                          <span>ID: {v.youtubeId}</span>
                          {v.channelName && (
                            <>
                              <span>•</span>
                              <span>{v.channelName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {v.categoryLabel ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-black/[0.05] text-ink">
                          {v.categoryLabel}
                        </span>
                      ) : (
                        <span className="text-ink-muted text-xs">Uncategorized</span>
                      )}
                    </td>

                    {/* Status & Featured */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wider ${
                            v.status === "published"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {v.status}
                        </span>

                        {v.status === "published" && activeTab !== "trash" && (
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(v.id)}
                            aria-label={v.featured ? "Featured video" : "Make featured"}
                            title={v.featured ? "Currently Featured" : "Click to Feature"}
                            className={`p-1 rounded-full hover:bg-black/5 transition-colors ${
                              v.featured ? "text-amber-500" : "text-ink-muted hover:text-amber-500"
                            }`}
                          >
                            <Star className={`w-3.5 h-3.5 ${v.featured ? "fill-current" : ""}`} />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Updated IST */}
                    <td className="py-3 px-4 text-xs text-ink-muted whitespace-nowrap">
                      {formatUtcToIst(v.updatedAt)}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {activeTab === "trash" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRestore(v.id)}
                              className="px-2.5 py-1.5 text-xs rounded-lg border border-line bg-white hover:bg-black/5 text-ink flex items-center gap-1"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Restore
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteTarget(v);
                                setTypedConfirmation("");
                                setDeleteError(null);
                              }}
                              className="px-2.5 py-1.5 text-xs rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete Permanently
                            </button>
                          </>
                        ) : (
                          <>
                            <Link
                              href={`${baseOwnerPath}/videos/${v.id}/edit`}
                              className="p-1.5 rounded-lg border border-line bg-white hover:bg-black/5 text-ink text-xs inline-flex items-center"
                              title="Edit Video"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Link>

                            {v.status === "published" && (
                              <Link
                                href={`/videos/${v.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg border border-line bg-white hover:bg-black/5 text-ink-muted hover:text-ink text-xs inline-flex items-center"
                                title="View Live Page"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            )}

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(v.id, v.status)}
                              className="px-2 py-1 text-xs rounded-lg border border-line hover:bg-black/5 text-ink-muted hover:text-ink"
                            >
                              {v.status === "published" ? "Unpublish" : "Publish"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleTrash(v.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-ink-muted hover:text-red-600 transition-colors"
                              title="Move to Trash"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Permanent Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-line shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-ink">
                  Permanently Delete Video
                </h3>
                <p className="text-xs text-ink-muted">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-ink leading-relaxed">
              To delete this video permanently from storage, type its title:
              <br />
              <strong className="text-ink font-semibold select-all">
                {deleteTarget.title}
              </strong>
            </p>

            <input
              type="text"
              value={typedConfirmation}
              onChange={(e) => setTypedConfirmation(e.target.value)}
              placeholder="Type exact video title..."
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            />

            {deleteError && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                {deleteError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-line text-xs font-medium hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  typedConfirmation.trim() !== deleteTarget.title.trim() || isPending
                }
                onClick={handleConfirmPermanentDelete}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-30 flex items-center gap-1.5"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
