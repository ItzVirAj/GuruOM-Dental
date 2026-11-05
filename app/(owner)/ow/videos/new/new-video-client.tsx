"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Clock,
} from "lucide-react";
import { previewVideoLinkAction, createVideoAction, setVideoStatusAction } from "@/src/server/owner/videos/actions";

interface CategoryOption {
  slug: string;
  label: string;
}

interface NewVideoClientProps {
  categories: CategoryOption[];
  baseOwnerPath: string;
}

export function NewVideoClient({
  categories,
  baseOwnerPath,
}: NewVideoClientProps) {
  const router = useRouter();
  const [urlInput, setUrlInput] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{
    youtubeId: string;
    startSeconds: number | null;
    title: string;
    channelName?: string;
  } | null>(null);

  // Step 2 Form State
  const [customTitle, setCustomTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [startMinutes, setStartMinutes] = useState("");
  const [startSecs, setStartSecs] = useState("");
  const [uploadedOn, setUploadedOn] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, startTransition] = useTransition();

  const handleCheckLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsChecking(true);
    setCheckError(null);
    setPreviewData(null);

    try {
      const res = await previewVideoLinkAction(urlInput);
      setPreviewData(res);
      setCustomTitle(res.title);

      if (res.startSeconds) {
        const m = Math.floor(res.startSeconds / 60);
        const s = res.startSeconds % 60;
        setStartMinutes(String(m));
        setStartSecs(String(s));
      }
    } catch (err: unknown) {
      setCheckError(err instanceof Error ? err.message : "Failed to verify YouTube URL.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleCreate = async (targetStatus: "draft" | "published") => {
    if (!previewData) return;
    if (!consentChecked) {
      setSubmitError("You must acknowledge the clinical patient consent requirement.");
      return;
    }
    if (targetStatus === "published" && !description.trim()) {
      setSubmitError("Description is required to publish a video.");
      return;
    }

    setSubmitError(null);

    // Compute total start seconds
    let totalStartSeconds: number | null = null;
    const m = parseInt(startMinutes || "0", 10);
    const s = parseInt(startSecs || "0", 10);
    if (!isNaN(m) && !isNaN(s) && (m > 0 || s > 0)) {
      totalStartSeconds = Math.max(0, Math.min(86399, m * 60 + s));
    }

    startTransition(async () => {
      try {
        const created = await createVideoAction({
          url: urlInput,
          title: customTitle.trim() || previewData.title,
          description: description.trim(),
          categorySlug: categorySlug || null,
          startSeconds: totalStartSeconds,
          uploadedOn: uploadedOn || null,
        });

        if (targetStatus === "published") {
          await setVideoStatusAction(created.id, "published");
        }

        router.push(`${baseOwnerPath}/videos/${created.id}/edit`);
      } catch (err: unknown) {
        setSubmitError(
          err instanceof Error ? err.message : "Failed to create video entry."
        );
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back Link */}
      <Link
        href={`${baseOwnerPath}/videos`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-ink transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Videos Library
      </Link>

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          Add YouTube Video
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1 font-body">
          Paste a YouTube link. Our secure server will verify the metadata, import the cover thumbnail, and prepare privacy-first playback.
        </p>
      </div>

      {/* Step 1: Link Input Card */}
      <div className="p-6 rounded-2xl bg-white border border-line shadow-xs space-y-4">
        <h2 className="font-display font-semibold text-base text-ink">
          Step 1: Check YouTube Link
        </h2>

        <form onSubmit={handleCheckLink} className="space-y-3">
          <label htmlFor="yt-url" className="text-xs font-medium text-ink block">
            YouTube Video URL
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="yt-url"
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
              className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-line bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand font-mono"
            />
            <button
              type="submit"
              disabled={isChecking || !urlInput.trim()}
              className="px-5 py-2.5 bg-brand hover:bg-brand-accent text-white rounded-xl text-xs sm:text-sm font-medium transition-all shadow-xs disabled:opacity-40 flex items-center justify-center gap-2 min-h-[44px]"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check Link"
              )}
            </button>
          </div>

          <p className="text-[11px] text-ink-muted">
            Supports standard watch, shorts, live, embed, and youtu.be URLs. Playlists and channels are rejected.
          </p>
        </form>

        {/* Check Error Notice */}
        {checkError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to process link</p>
              <p className="mt-0.5">{checkError}</p>
            </div>
          </div>
        )}

        {/* Check Success Preview Card */}
        {previewData && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Link successfully verified</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-emerald-200/60 text-emerald-850">
              <div>
                <span className="font-medium text-emerald-700">Video ID: </span>
                <code className="font-mono">{previewData.youtubeId}</code>
              </div>
              {previewData.channelName && (
                <div>
                  <span className="font-medium text-emerald-700">Channel: </span>
                  <span>{previewData.channelName}</span>
                </div>
              )}
              <div className="sm:col-span-2">
                <span className="font-medium text-emerald-700">Original Title: </span>
                <span>{previewData.title}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Metadata & Publishing Form */}
      {previewData && (
        <div className="p-6 rounded-2xl bg-white border border-line shadow-xs space-y-6 animate-in fade-in slide-in-from-top-2">
          <h2 className="font-display font-semibold text-base text-ink">
            Step 2: Video Details & Consent
          </h2>

          <div className="space-y-4 text-xs sm:text-sm">
            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="video-title" className="font-medium text-ink block">
                Video Title <span className="text-red-500">*</span>
              </label>
              <input
                id="video-title"
                type="text"
                value={customTitle}
                maxLength={160}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand font-medium"
              />
              <span className="text-[11px] text-ink-muted">
                {customTitle.length}/160 characters
              </span>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="video-desc" className="font-medium text-ink block">
                Description / Educational Summary <span className="text-red-500">*</span>
              </label>
              <textarea
                id="video-desc"
                rows={4}
                value={description}
                maxLength={600}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what patients learn from this clinical walkthrough..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              />
              <span className="text-[11px] text-ink-muted">
                {description.length}/600 characters
              </span>
            </div>

            {/* Topic / Category */}
            <div className="space-y-1.5">
              <label htmlFor="video-cat" className="font-medium text-ink block">
                Clinical Topic / Category
              </label>
              <select
                id="video-cat"
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

            {/* Start Time (MM:SS) */}
            <div className="space-y-1.5">
              <label className="font-medium text-ink block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-ink-muted" />
                Start Time (Optional)
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

            {/* Uploaded On Date */}
            <div className="space-y-1.5">
              <label htmlFor="video-date" className="font-medium text-ink block flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-ink-muted" />
                Original Upload Date (Optional)
              </label>
              <input
                id="video-date"
                type="date"
                value={uploadedOn}
                onChange={(e) => setUploadedOn(e.target.value)}
                className="max-w-xs px-3.5 py-2 rounded-xl border border-line bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              />
              <p className="text-[11px] text-ink-muted">
                Entering this date enables Google Search VideoObject structured rich results.
              </p>
            </div>

            {/* Patient Consent Checkbox */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-0.5 rounded border-line text-brand focus-visible:ring-brand"
                />
                <span className="text-xs text-amber-950 font-medium leading-relaxed">
                  Only add videos you own or have the right to show. Never show identifiable patients without their written consent.
                </span>
              </label>
            </div>

            {/* Submit Error */}
            {submitError && (
              <p className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
                {submitError}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-line/60">
              <Link
                href={`${baseOwnerPath}/videos`}
                className="px-4 py-2.5 rounded-full border border-line text-xs font-medium hover:bg-black/5 min-h-[44px] flex items-center"
              >
                Cancel
              </Link>

              <button
                type="button"
                disabled={isSubmitting || !consentChecked}
                onClick={() => handleCreate("draft")}
                className="px-5 py-2.5 rounded-full border border-line bg-surface hover:bg-black/5 text-ink text-xs font-medium transition-colors disabled:opacity-40 min-h-[44px] flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save as Draft
              </button>

              <button
                type="button"
                disabled={isSubmitting || !consentChecked || !description.trim()}
                onClick={() => handleCreate("published")}
                className="px-6 py-2.5 rounded-full bg-brand hover:bg-brand-accent text-white text-xs font-medium shadow-sm transition-all disabled:opacity-40 min-h-[44px] flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Publish Immediately
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
