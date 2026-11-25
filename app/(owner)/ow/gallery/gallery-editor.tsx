"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { MediaPickerModal, type SelectedMediaPayload } from "@/components/editor/media-picker-modal";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import { SmartImage } from "@/components/ui/SmartImage";
import type { GalleryItem } from "@/data/home";
import { saveGallery } from "@/src/server/owner/gallery/actions";

const button = "rounded-lg border border-line px-3 py-2 text-sm font-semibold hover:bg-surface-alt disabled:opacity-50";
const input = "mt-1 block w-full rounded-lg border border-line bg-white px-3 py-2 text-base";

export function GalleryEditor({ initial }: { initial: { items: GalleryItem[]; revision: string } }) {
  const [items, setItems] = useState(initial.items);
  const [revision, setRevision] = useState(initial.revision);
  const [picker, setPicker] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [justPublished, setJustPublished] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [published, setPublished] = useState(initial.items);
  const [deletePhotos, setDeletePhotos] = useState(false);
  const currentPhotos = new Set(items.map(card => card.mediaId));
  const hasRemovedPhotos = published.some(card => card.mediaId && !currentPhotos.has(card.mediaId));

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  function change(next: GalleryItem[]) {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    setJustPublished(false);
    setItems(next);
    setDirty(true);
    setMessage(null);
  }

  function edit(id: string, patch: Partial<GalleryItem>) {
    change(items.map(card => card.id === id ? { ...card, ...patch } : card));
  }

  function selectImage(image: SelectedMediaPayload) {
    const asset = { mediaId: image.id, publicId: image.publicId, imageSlot: undefined,
      alt: image.decorative ? "" : image.alt ?? undefined };
    if (picker === "new") {
      change([...items, { ...asset, id: crypto.randomUUID(), title: image.displayName.slice(0, 120), label: "" }]);
    } else if (picker) {
      edit(picker, asset);
    }
  }

  async function publish(event: React.FormEvent) {
    event.preventDefault();
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    setSaving(true);
    setJustPublished(false);
    setMessage(null);
    try {
      const result = await saveGallery(items, revision, hasRemovedPhotos && deletePhotos);
      if ("revision" in result && result.revision) {
        setRevision(result.revision);
        setDirty(false);
        setPublished(items);
        setDeletePhotos(false);
        setJustPublished(true);
        const status = ["Published changes."];
        if (result.queued) status.push(`Queued for Cloudinary deletion: ${result.queued}.`);
        if (result.retained) status.push(`Kept because they are used elsewhere: ${result.retained}.`);
        setMessage({ type: "success", text: status.join(" ") });
        resetTimerRef.current = setTimeout(() => {
          setJustPublished(false);
          resetTimerRef.current = null;
        }, 2500);
      } else {
        setMessage({ type: "error", text: result.error ?? "Could not publish the gallery." });
      }
    } catch {
      setMessage({ type: "error", text: "Could not publish the gallery. Your edits are still here." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <form onSubmit={publish}>
        <fieldset disabled={saving} className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Homepage gallery</h1>
              <p className="mt-1 text-sm text-ink-muted">{items.length} {items.length === 1 ? "card" : "cards"}{dirty && " · Unpublished changes"}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className={button} onClick={() => setPicker("new")}>Add card</button>
              <button
                type="submit"
                disabled={!dirty || saving || justPublished}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
                  justPublished
                    ? "bg-emerald-600"
                    : saving
                    ? "bg-brand"
                    : "bg-brand hover:bg-brand-dark disabled:opacity-50"
                }`}
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {justPublished && <Check className="h-4 w-4" aria-hidden="true" />}
                <span>{saving ? "Publishing…" : justPublished ? "Published changes" : "Publish changes"}</span>
              </button>
            </div>
          </div>
          {hasRemovedPhotos && (
            <label className="mb-4 flex items-start gap-2 text-sm">
              <input type="checkbox" checked={deletePhotos} onChange={event => setDeletePhotos(event.target.checked)} />
              Permanently delete unused photos removed or replaced in this update from the media library and Cloudinary.
            </label>
          )}
          <div role="status" aria-live="polite" className="mb-3">
            {message && (
              <p
                className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium ${
                  message.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message.type === "success" && <Check className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />}
                <span>{message.text}</span>
              </p>
            )}
          </div>
          {!items.length && <p>The homepage gallery is hidden when you publish zero cards.</p>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((card, index) => (
              <article key={card.id} aria-label={`Gallery card ${index + 1}`} className="space-y-3 rounded-2xl border border-line bg-white p-4">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-surface-alt">
                  {card.publicId ? <CloudinaryImage src={card.publicId} alt={card.alt ?? card.title} fill sizes="360px" className="object-cover" /> :
                    <SmartImage slot={card.imageSlot} label={card.title} className="h-full" />}
                </div>
                <div className="flex justify-between gap-2">
                  <button type="button" className={button} onClick={() => setPicker(card.id)}>Replace image</button>
                  <button type="button" className={button} onClick={() => change(items.filter(item => item.id !== card.id))}>Remove card</button>
                </div>
                <label className="block text-sm font-medium">Image title
                  <input className={input} value={card.title} required maxLength={120} onChange={e => edit(card.id, { title: e.target.value })} />
                </label>
                <label className="block text-sm font-medium">Badge
                  <input className={input} value={card.label} maxLength={50} onChange={e => edit(card.id, { label: e.target.value })} />
                </label>
              </article>
            ))}
          </div>
        </fieldset>
      </form>
      {picker && <MediaPickerModal isOpen title={picker === "new" ? "Add gallery image" : "Replace gallery image"} defaultAspect="4/5" onClose={() => setPicker(null)} onSelect={selectImage} />}
    </>
  );
}

