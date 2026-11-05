"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OwnerPostsListResult, OwnerPostItem, PostTab } from "@/src/server/owner/posts/queries";
import {
  createPostAction,
  duplicatePostAction,
  unpublishPostAction,
  archivePostAction,
  trashPostAction,
  restorePostAction,
  deletePermanentlyAction,
} from "@/src/server/owner/posts/actions";
import {
  Plus,
  Search,
  ExternalLink,
  Edit,
  Eye,
  Copy,
  Archive,
  Trash2,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  Clock,
  Sparkles,
} from "lucide-react";

interface PostsListViewProps {
  initialData: OwnerPostsListResult;
  currentQuery: {
    tab: PostTab;
    search: string;
    category: string;
    sort: string;
    order: string;
    page: number;
  };
  baseOwnerPath?: string;
}

export function PostsListView({ initialData, currentQuery, baseOwnerPath }: PostsListViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const base = baseOwnerPath || "/ow";

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Permanent Delete modal state
  const [deleteModalPost, setDeleteModalPost] = useState<OwnerPostItem | null>(null);
  const [deleteConfirmationTitle, setDeleteConfirmationTitle] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const updateFilters = (newParams: Record<string, string | number>) => {
    const params = new URLSearchParams(window.location.search);
    for (const [k, v] of Object.entries(newParams)) {
      if (v === "" || v === undefined) {
        params.delete(k);
      } else {
        params.set(k, String(v));
      }
    }
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleTabChange = (newTab: PostTab) => {
    setSelectedIds([]);
    updateFilters({ tab: newTab, page: 1 });
  };

  const handleCreateNew = () => {
    startTransition(async () => {
      try {
        const res = await createPostAction();
        showToast("New draft created!");
        router.push(`${base}/posts/${res.id}/edit`);
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to create draft", "error");
      }
    });
  };

  const handleDuplicate = (id: string) => {
    startTransition(async () => {
      try {
        const res = await duplicatePostAction(id);
        showToast("Post duplicated as draft!");
        router.push(`${base}/posts/${res.id}/edit`);
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Duplicate failed", "error");
      }
    });
  };

  const handleUnpublish = (id: string) => {
    startTransition(async () => {
      try {
        await unpublishPostAction(id);
        showToast("Post unpublished and moved to drafts.");
        router.refresh();
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Unpublish failed", "error");
      }
    });
  };

  const handleArchive = (id: string) => {
    startTransition(async () => {
      try {
        await archivePostAction(id);
        showToast("Post moved to archive.");
        router.refresh();
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Archive failed", "error");
      }
    });
  };

  const handleTrash = (id: string) => {
    startTransition(async () => {
      try {
        await trashPostAction(id);
        showToast("Post moved to Trash.");
        setSelectedIds((prev) => prev.filter((i) => i !== id));
        router.refresh();
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Trash failed", "error");
      }
    });
  };

  const handleRestore = (id: string) => {
    startTransition(async () => {
      try {
        await restorePostAction(id);
        showToast("Post restored as draft.");
        setSelectedIds((prev) => prev.filter((i) => i !== id));
        router.refresh();
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Restore failed", "error");
      }
    });
  };

  const handleBulkTrash = () => {
    if (selectedIds.length === 0) return;
    startTransition(async () => {
      try {
        for (const id of selectedIds) {
          await trashPostAction(id);
        }
        showToast(`${selectedIds.length} posts moved to Trash.`);
        setSelectedIds([]);
        router.refresh();
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Bulk trash failed", "error");
      }
    });
  };

  const handleBulkRestore = () => {
    if (selectedIds.length === 0) return;
    startTransition(async () => {
      try {
        for (const id of selectedIds) {
          await restorePostAction(id);
        }
        showToast(`${selectedIds.length} posts restored as drafts.`);
        setSelectedIds([]);
        router.refresh();
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Bulk restore failed", "error");
      }
    });
  };

  const handleBulkArchive = () => {
    if (selectedIds.length === 0) return;
    startTransition(async () => {
      try {
        for (const id of selectedIds) {
          await archivePostAction(id);
        }
        showToast(`${selectedIds.length} posts archived.`);
        setSelectedIds([]);
        router.refresh();
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Bulk archive failed", "error");
      }
    });
  };

  const handlePermanentDelete = () => {
    if (!deleteModalPost) return;
    if (deleteConfirmationTitle.trim() !== deleteModalPost.title.trim()) {
      setDeleteError("Confirmation title does not match.");
      return;
    }

    startTransition(async () => {
      try {
        await deletePermanentlyAction(deleteModalPost.id, deleteConfirmationTitle.trim());
        showToast(`Post "${deleteModalPost.title}" permanently deleted.`);
        setDeleteModalPost(null);
        setDeleteConfirmationTitle("");
        setDeleteError("");
        router.refresh();
      } catch (err) {
        setDeleteError(err instanceof Error ? err.message : "Failed to permanently delete post.");
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === initialData.posts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(initialData.posts.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const tabs: { key: PostTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: initialData.counts.all },
    { key: "published", label: "Published", count: initialData.counts.published },
    { key: "scheduled", label: "Scheduled", count: initialData.counts.scheduled },
    { key: "draft", label: "Drafts", count: initialData.counts.draft },
    { key: "archived", label: "Archived", count: initialData.counts.archived },
    { key: "trash", label: "Trash", count: initialData.counts.trash },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold transition-all ${
            toast.type === "error"
              ? "bg-rose-600 text-white"
              : "bg-ink text-white"
          }`}
        >
          {toast.type === "error" ? (
            <AlertTriangle className="w-4 h-4 text-rose-200" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-teal" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header & Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Articles & Guides</h1>
          <p className="text-xs text-ink-muted">
            Manage, write, schedule, and optimize dental publications.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white font-semibold text-xs shadow-sm hover:bg-brand-dark transition-colors focus-visible:ring-2 focus-visible:ring-brand min-h-[44px]"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          <span>New Post</span>
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1 border-b border-line overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = currentQuery.tab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap min-h-[44px] ${
                isActive
                  ? "border-brand text-brand"
                  : "border-transparent text-ink-muted hover:text-ink hover:border-line"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] ${
                  isActive ? "bg-brand/10 text-brand font-bold" : "bg-muted text-ink-muted"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-line rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
            <input
              type="search"
              placeholder="Search posts by title..."
              defaultValue={currentQuery.search}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateFilters({ search: (e.target as HTMLInputElement).value, page: 1 });
                }
              }}
              onBlur={(e) => {
                if (e.target.value !== currentQuery.search) {
                  updateFilters({ search: e.target.value, page: 1 });
                }
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-line bg-surface text-ink placeholder:text-ink-muted/60 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-hidden min-h-[44px]"
            />
          </div>

          {/* Category Filter */}
          <div className="w-full sm:w-48">
            <select
              aria-label="Filter by category"
              value={currentQuery.category}
              onChange={(e) => updateFilters({ category: e.target.value, page: 1 })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-line bg-surface text-ink focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-hidden min-h-[44px]"
            >
              <option value="">All Categories</option>
              {initialData.categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="w-full sm:w-48">
            <select
              aria-label="Sort posts by"
              value={`${currentQuery.sort}-${currentQuery.order}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split("-");
                updateFilters({ sort, order, page: 1 });
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-line bg-surface text-ink focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-hidden min-h-[44px]"
            >
              <option value="updated-desc">Recently Updated</option>
              <option value="updated-asc">Oldest Updated</option>
              <option value="published-desc">Publish Date (Newest)</option>
              <option value="published-asc">Publish Date (Oldest)</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Selected Items / Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-line">
            <span className="text-xs font-semibold text-ink-muted">
              {selectedIds.length} selected
            </span>
            {currentQuery.tab === "trash" ? (
              <button
                type="button"
                onClick={handleBulkRestore}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal/10 text-teal text-xs font-semibold hover:bg-teal/20 transition-colors min-h-[44px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleBulkArchive}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-semibold hover:bg-purple-100 transition-colors min-h-[44px]"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Archive</span>
                </button>
                <button
                  type="button"
                  onClick={handleBulkTrash}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors min-h-[44px]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Move to Trash</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Posts Table */}
      <div className="bg-white border border-line rounded-2xl overflow-hidden shadow-xs">
        {initialData.posts.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface border border-line text-ink-muted flex items-center justify-center mx-auto mb-3">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-ink text-sm">No posts found</h3>
            <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
              {currentQuery.search
                ? `No results matching "${currentQuery.search}". Try clearing search or filters.`
                : "No articles present in this view."}
            </p>
            {currentQuery.search && (
              <button
                type="button"
                onClick={() => updateFilters({ search: "", page: 1 })}
                className="mt-4 px-4 py-2 rounded-xl bg-surface hover:bg-muted text-ink font-semibold text-xs border border-line min-h-[44px]"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface/60 border-b border-line text-ink-muted uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th scope="col" className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label="Select all posts on this page"
                      checked={
                        selectedIds.length === initialData.posts.length &&
                        initialData.posts.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-line text-brand focus:ring-brand w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th scope="col" className="px-4 py-3">Title & Category</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Dates (IST)</th>
                  <th scope="col" className="px-4 py-3">Author</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {initialData.posts.map((post) => {
                  const isSelected = selectedIds.includes(post.id);

                  return (
                    <tr
                      key={post.id}
                      className={`hover:bg-surface/40 transition-colors ${
                        isSelected ? "bg-brand/5" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          aria-label={`Select post "${post.title}"`}
                          checked={isSelected}
                          onChange={() => toggleSelectOne(post.id)}
                          className="rounded border-line text-brand focus:ring-brand w-4 h-4 cursor-pointer"
                        />
                      </td>

                      {/* Title & Category */}
                      <td className="px-4 py-3.5 max-w-md">
                        <div className="flex items-start gap-2">
                          <div>
                            <Link
                              href={`${base}/posts/${post.id}/edit`}
                              className="font-bold text-ink hover:text-brand transition-colors text-sm block leading-snug line-clamp-1"
                            >
                              {post.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] font-medium text-ink-muted">
                                {post.categoryLabel}
                              </span>
                              {post.featured && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  Featured
                                </span>
                              )}
                              <span className="text-[11px] text-ink-muted font-mono">
                                v{post.version}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {post.effectiveStatus === "published" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Published
                          </span>
                        )}
                        {post.effectiveStatus === "scheduled" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Scheduled
                            {post.relativePublishDate && (
                              <span className="font-normal text-amber-600 ml-0.5">
                                ({post.relativePublishDate})
                              </span>
                            )}
                          </span>
                        )}
                        {post.effectiveStatus === "draft" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                            Draft
                          </span>
                        )}
                        {post.effectiveStatus === "archived" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            <Archive className="w-3 h-3 text-purple-600" />
                            Archived
                          </span>
                        )}
                        {post.effectiveStatus === "trash" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <Trash2 className="w-3 h-3 text-rose-600" />
                            In Trash
                          </span>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <p className="text-ink font-medium text-xs">
                            {post.publishAtIst !== "—" ? post.publishAtIst : "Not published"}
                          </p>
                          <p className="text-[10px] text-ink-muted">
                            Updated: {post.updatedAtIst}
                          </p>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-xs text-ink">{post.authorName}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {post.effectiveStatus === "trash" ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleRestore(post.id)}
                                disabled={isPending}
                                title="Restore as draft"
                                className="p-2 rounded-lg text-ink-muted hover:text-teal hover:bg-teal/10 transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteModalPost(post);
                                  setDeleteConfirmationTitle("");
                                  setDeleteError("");
                                }}
                                disabled={isPending}
                                title="Delete permanently"
                                className="p-2 rounded-lg text-ink-muted hover:text-rose-600 hover:bg-rose-50 transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <Link
                                href={`${base}/posts/${post.id}/edit`}
                                title="Edit post"
                                className="p-2 rounded-lg text-ink-muted hover:text-brand hover:bg-surface transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>

                              <Link
                                href={`${base}/posts/${post.id}/preview`}
                                target="_blank"
                                title="Preview working copy in new tab"
                                className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-surface transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>

                              {post.effectiveStatus === "published" && (
                                <Link
                                  href={`/blog/${post.slug}`}
                                  target="_blank"
                                  title="View live post"
                                  className="p-2 rounded-lg text-ink-muted hover:text-teal hover:bg-surface transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Link>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDuplicate(post.id)}
                                disabled={isPending}
                                title="Duplicate as draft"
                                className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-surface transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                              >
                                <Copy className="w-4 h-4" />
                              </button>

                              {post.effectiveStatus === "published" && (
                                <button
                                  type="button"
                                  onClick={() => handleUnpublish(post.id)}
                                  disabled={isPending}
                                  title="Unpublish to draft"
                                  className="p-2 rounded-lg text-ink-muted hover:text-amber-600 hover:bg-amber-50 transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                                >
                                  <Clock className="w-4 h-4" />
                                </button>
                              )}

                              {post.effectiveStatus !== "archived" && (
                                <button
                                  type="button"
                                  onClick={() => handleArchive(post.id)}
                                  disabled={isPending}
                                  title="Archive post"
                                  className="p-2 rounded-lg text-ink-muted hover:text-purple-600 hover:bg-purple-50 transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                                >
                                  <Archive className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleTrash(post.id)}
                                disabled={isPending}
                                title="Move to Trash"
                                className="p-2 rounded-lg text-ink-muted hover:text-rose-600 hover:bg-rose-50 transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {initialData.totalPages > 1 && (
          <div className="p-4 border-t border-line flex items-center justify-between">
            <span className="text-xs text-ink-muted">
              Page {initialData.page} of {initialData.totalPages} ({initialData.total} items)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={initialData.page <= 1 || isPending}
                onClick={() => updateFilters({ page: initialData.page - 1 })}
                className="px-3 py-1.5 rounded-xl border border-line bg-surface hover:bg-muted text-xs font-semibold text-ink disabled:opacity-40 min-h-[44px]"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={initialData.page >= initialData.totalPages || isPending}
                onClick={() => updateFilters({ page: initialData.page + 1 })}
                className="px-3 py-1.5 rounded-xl border border-line bg-surface hover:bg-muted text-xs font-semibold text-ink disabled:opacity-40 min-h-[44px]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Accessible Permanent Delete Confirmation Dialog */}
      {deleteModalPost && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onKeyDown={(e) => {
            if (e.key === "Escape") setDeleteModalPost(null);
          }}
        >
          <div className="bg-white border border-line rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h2 id="delete-dialog-title" className="font-display font-bold text-base text-ink">
                  Permanent Delete Confirmation
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModalPost(null)}
                className="p-1 rounded-lg text-ink-muted hover:text-ink min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              This action <span className="font-bold text-rose-600">CANNOT BE UNDONE</span>.
              The article, revisions, and working copy will be permanently deleted from the database.
            </p>

            <div className="bg-surface border border-line p-3 rounded-xl text-xs space-y-1">
              <span className="text-[11px] text-ink-muted font-medium block">
                Type the exact post title to confirm:
              </span>
              <p className="font-mono font-bold text-ink select-all">
                {deleteModalPost.title}
              </p>
            </div>

            <input
              type="text"
              autoFocus
              value={deleteConfirmationTitle}
              onChange={(e) => {
                setDeleteConfirmationTitle(e.target.value);
                setDeleteError("");
              }}
              placeholder="Type post title here..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-line bg-surface text-ink focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-hidden min-h-[44px]"
            />

            {deleteError && (
              <p className="text-xs text-rose-600 font-semibold">{deleteError}</p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalPost(null)}
                className="px-4 py-2 rounded-xl border border-line bg-surface hover:bg-muted text-xs font-semibold text-ink min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePermanentDelete}
                disabled={
                  isPending ||
                  deleteConfirmationTitle.trim() !== deleteModalPost.title.trim()
                }
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold disabled:opacity-40 min-h-[44px]"
              >
                {isPending ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
