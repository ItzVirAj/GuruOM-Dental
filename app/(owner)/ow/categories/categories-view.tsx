"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createCategoryAction,
  renameCategoryAction,
  reorderCategoriesAction,
  deleteCategoryAction,
} from "@/src/server/owner/posts/actions";
import { generateSlug } from "@/src/server/owner/posts/slug";
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FolderTree,
  Loader2,
  X,
  Check,
} from "lucide-react";

interface CategoryItem {
  slug: string;
  label: string;
  sortOrder: number;
  postCount: number;
}

interface CategoriesViewProps {
  initialCategories: CategoryItem[];
}

export function CategoriesView({ initialCategories }: CategoriesViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [newLabel, setNewLabel] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    startTransition(async () => {
      try {
        setErrorMessage("");
        await createCategoryAction(newLabel.trim(), newSlug.trim() || undefined);
        showToast(`Category "${newLabel.trim()}" created successfully!`);
        setNewLabel("");
        setNewSlug("");
        router.refresh();
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Failed to create category");
      }
    });
  };

  const handleRename = (slug: string) => {
    if (!editingLabel.trim()) return;

    startTransition(async () => {
      try {
        setErrorMessage("");
        await renameCategoryAction(slug, editingLabel.trim());
        showToast("Category renamed successfully!");
        setEditingSlug(null);
        setEditingLabel("");
        router.refresh();
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Failed to rename category");
      }
    });
  };

  const handleDelete = (cat: CategoryItem) => {
    if (cat.postCount > 0) {
      setErrorMessage(
        `Cannot delete "${cat.label}" because ${cat.postCount} post(s) are assigned to it. Reassign or delete those posts first.`
      );
      return;
    }

    const conf = window.confirm(`Are you sure you want to delete the category "${cat.label}"?`);
    if (!conf) return;

    startTransition(async () => {
      try {
        setErrorMessage("");
        await deleteCategoryAction(cat.slug);
        showToast(`Category "${cat.label}" deleted.`);
        router.refresh();
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Failed to delete category");
      }
    });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const reordered = [...categories];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    setCategories(reordered);

    startTransition(async () => {
      try {
        setErrorMessage("");
        const slugs = reordered.map((c) => c.slug);
        await reorderCategoriesAction(slugs);
        showToast("Category order updated.");
        router.refresh();
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Failed to reorder categories");
        setCategories(initialCategories);
      }
    });
  };

  return (
    <div className="space-y-8 font-body">
      {/* Toast Alert */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold transition-all ${
            toast.type === "error" ? "bg-rose-600 text-white" : "bg-ink text-white"
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

      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Category Management</h1>
        <p className="text-xs text-ink-muted">
          Organize publications into clinical topics. Slugs remain immutable to protect permalink stability.
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-rose-900">Operation Notice</h4>
            <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage("")}
            className="text-rose-500 hover:text-rose-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create New Category Card */}
      <div className="bg-white border border-line rounded-3xl p-6 shadow-xs space-y-4">
        <h2 className="font-display font-bold text-sm text-ink flex items-center gap-2">
          <Plus className="w-4 h-4 text-brand" />
          <span>Add New Category</span>
        </h2>

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <label htmlFor="new-cat-label" className="block text-xs font-semibold text-ink mb-1">
              Category Label
            </label>
            <input
              id="new-cat-label"
              type="text"
              required
              placeholder="e.g. Pediatric Dentistry"
              value={newLabel}
              onChange={(e) => {
                setNewLabel(e.target.value);
                if (!newSlug || newSlug === generateSlug(newLabel)) {
                  setNewSlug(generateSlug(e.target.value));
                }
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-line bg-surface text-ink focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-hidden min-h-[44px]"
            />
          </div>

          <div className="sm:col-span-5">
            <label htmlFor="new-cat-slug" className="block text-xs font-semibold text-ink mb-1">
              URL Slug (Immutable once created)
            </label>
            <input
              id="new-cat-slug"
              type="text"
              required
              placeholder="e.g. pediatric-dentistry"
              value={newSlug}
              onChange={(e) => setNewSlug(generateSlug(e.target.value))}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-line bg-surface text-ink focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-hidden min-h-[44px]"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isPending || !newLabel.trim()}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand text-white font-semibold text-xs hover:bg-brand-dark transition-colors min-h-[44px] disabled:opacity-40"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Create</span>
            </button>
          </div>
        </form>
      </div>

      {/* Categories List Table */}
      <div className="bg-white border border-line rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-brand" />
            <h3 className="font-display font-bold text-sm text-ink">Active Categories</h3>
          </div>
          <span className="text-xs text-ink-muted">{categories.length} categories</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/60 border-b border-line text-ink-muted uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th scope="col" className="w-16 px-4 py-3 text-center">Order</th>
                <th scope="col" className="px-4 py-3">Category Label</th>
                <th scope="col" className="px-4 py-3 font-mono">Slug</th>
                <th scope="col" className="px-4 py-3 text-center">Assigned Posts</th>
                <th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {categories.map((cat, idx) => {
                const isEditing = editingSlug === cat.slug;

                return (
                  <tr key={cat.slug} className="hover:bg-surface/30 transition-colors">
                    {/* Order Controls */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0 || isPending}
                          onClick={() => handleMove(idx, "up")}
                          aria-label={`Move category "${cat.label}" up`}
                          className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-muted disabled:opacity-20 min-h-[32px] min-w-[32px] inline-flex items-center justify-center"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === categories.length - 1 || isPending}
                          onClick={() => handleMove(idx, "down")}
                          aria-label={`Move category "${cat.label}" down`}
                          className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-muted disabled:opacity-20 min-h-[32px] min-w-[32px] inline-flex items-center justify-center"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Label */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            autoFocus
                            value={editingLabel}
                            onChange={(e) => setEditingLabel(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRename(cat.slug);
                              if (e.key === "Escape") setEditingSlug(null);
                            }}
                            className="px-2.5 py-1 text-xs rounded-lg border border-line bg-surface text-ink focus-visible:ring-2 focus-visible:ring-brand min-h-[36px]"
                          />
                          <button
                            type="button"
                            onClick={() => handleRename(cat.slug)}
                            className="p-1.5 rounded-lg bg-teal text-white hover:bg-teal/90 min-h-[36px] min-w-[36px] inline-flex items-center justify-center"
                            title="Confirm rename"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSlug(null)}
                            className="p-1.5 rounded-lg border border-line text-ink-muted hover:text-ink min-h-[36px] min-w-[36px] inline-flex items-center justify-center"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-bold text-ink text-sm">{cat.label}</span>
                      )}
                    </td>

                    {/* Slug */}
                    <td className="px-4 py-3 font-mono text-ink-muted text-xs">
                      {cat.slug}
                    </td>

                    {/* Posts Count */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface border border-line text-ink">
                        {cat.postCount}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSlug(cat.slug);
                            setEditingLabel(cat.label);
                          }}
                          className="p-2 rounded-lg text-ink-muted hover:text-brand hover:bg-surface min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                          title="Rename category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          disabled={isPending}
                          className="p-2 rounded-lg text-ink-muted hover:text-rose-600 hover:bg-rose-50 min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                          title={cat.postCount > 0 ? "Cannot delete category in use" : "Delete category"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
