"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { homeImageGroups, heroLogoSrc, type HomeImage, type HomeImages } from "@/data/home-images";
import { plannedImages } from "@/data/images";
import { MediaPickerModal, type SelectedMediaPayload } from "@/components/editor/media-picker-modal";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import { replaceHomeImage } from "@/src/server/owner/gallery/replace-home-image";

function FixedImage({ slot, label, initial }: { slot: string; label: string; initial?: HomeImage }) {
  const [live, setLive] = useState(initial);
  const [draft, setDraft] = useState<SelectedMediaPayload | null>(null);
  const [picking, setPicking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const logo = slot === "heroTitleLogo";
  const localSrc = logo ? heroLogoSrc : plannedImages[slot]?.src;
  const publicId = draft?.publicId ?? live?.publicId;
  const imageClass = logo ? "object-contain p-3" : "object-cover";
  const ratio = plannedImages[slot]?.ratio;
  const crop = ratio === "16/9" || ratio === "4/5" || ratio === "4/3" ? ratio : "free";

  async function publish() {
    if (!draft) return;
    setSaving(true);
    try {
      const { error } = await replaceHomeImage(slot, draft.id, live?.mediaId ?? null);
      if (error) {
        setStatus(error);
      } else {
        setLive({ mediaId: draft.id, publicId: draft.publicId, alt: draft.alt });
        setDraft(null);
        setStatus("Published.");
      }
    } catch {
      setStatus("Could not publish this image. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-line bg-white p-3">
      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-surface-alt">
        {publicId ? <CloudinaryImage src={publicId} alt={label} fill sizes="320px" className={imageClass} />
          : localSrc ? <Image src={localSrc} alt={label} fill sizes="320px" className={imageClass} />
          : <span className="text-sm text-ink-muted">Placeholder</span>}
      </div>
      <h3 className="text-sm font-semibold">{label}</h3>
      <div className="mt-auto flex flex-wrap gap-2">
        <button type="button" disabled={saving} aria-label={`Replace image for ${label}`} onClick={() => setPicking(true)}
          className="rounded-lg border border-line px-3 py-2 text-sm font-medium hover:bg-surface-alt">Replace image</button>
        {draft && <button type="button" disabled={saving} onClick={publish}
          className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white">{saving ? "Publishing…" : "Publish image"}</button>}
      </div>
      <span role="status" className="text-sm text-ink-muted empty:hidden">{status}</span>
      {picking && <MediaPickerModal isOpen title={`Replace ${label}`} defaultAspect={crop} onClose={() => setPicking(false)}
        onSelect={image => { setDraft(image); setStatus("Unpublished replacement"); }} />}
    </article>
  );
}

export function FixedImageSections({ images }: { images: HomeImages }) {
  return homeImageGroups.map(group => (
    <details key={group.name} className="group rounded-2xl border border-line bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold">
        {group.name}
        <ChevronDown aria-hidden="true" className="size-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="grid gap-3 border-t border-line p-4 sm:grid-cols-2 lg:grid-cols-3">
        {group.slots.map(slot => <FixedImage key={slot.id} slot={slot.id} label={slot.label} initial={images[slot.id]} />)}
      </div>
    </details>
  ));
}
