"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";

import { ContentBlock, isSafeLink, calculateReadingTimeMinutes } from "@/src/lib/blog-content";
import { blocksToEditorDoc, editorDocToBlocks } from "@/src/lib/editor/converters";
import { sanitizePastedHtml } from "@/src/lib/editor/sanitize-paste";
import { Callout } from "@/src/lib/editor/nodes/callout";
import { LegacyImage } from "@/src/lib/editor/nodes/legacy-image";
import { ImageNode } from "@/src/lib/editor/nodes/image-node";
import { VideoNode } from "@/src/lib/editor/nodes/video-node";
import { MediaPickerModal, SelectedMediaPayload } from "@/components/editor/media-picker-modal";
import { VideoPickerModal, SelectedVideoPayload } from "@/components/editor/video-picker-modal";
import cloudinaryLoader from "@/src/lib/media/cloudinary-loader";
import { clientResizeImage } from "@/src/lib/media/client-resize";
import { uploadMediaAction } from "@/src/server/owner/media/actions";
import Image from "next/image";
import { generateSlug } from "@/src/server/owner/posts/slug";
import {
  istInputToUtc,
  formatUtcToIst,
  formatRelativeTime,
  validateScheduleDate,
} from "@/src/server/owner/posts/timezone";
import {
  autosaveWorkingCopyAction,
  savePostAction,
  publishNowAction,
  schedulePostAction,
  unschedulePostAction,
  unpublishPostAction,
  duplicatePostAction,
  type PostEditorData,
} from "@/src/server/owner/posts/actions";
import { doctorsData } from "@/data/doctors";
import { servicesData } from "@/data/services";
import {
  Save,
  Send,
  Calendar,
  Clock,
  Eye,
  ArrowLeft,
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  MessageSquare,
  Undo2,
  Redo2,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  History,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  HelpCircle,
  RotateCcw,
  AlertCircle,
  SlidersHorizontal,
  ChevronDown,
  FileText,
  Search,
  ShieldCheck,
  Tag as TagIcon,
} from "lucide-react";

export interface PostWorkingCopyData {
  title?: string;
  excerpt?: string;
  content?: ContentBlock[];
  categorySlug?: string;
  authorName?: string;
  authorRole?: string;
  reviewedByDoctorSlug?: string | null;
  relatedServiceSlug?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  featured?: boolean;
  tags?: string[];
  slug?: string;
  [key: string]: unknown;
}

export interface RevisionItem {
  id: string;
  createdAt: string;
  createdAtIst: string;
  action: string;
  reason: string | null;
  wordCount: number;
  snapshot: Record<string, unknown>;
}

interface PostEditorClientProps {
  post: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: ContentBlock[];
    categorySlug: string;
    authorName: string;
    authorRole: string;
    reviewedByDoctorSlug: string | null;
    relatedServiceSlug: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    featured: boolean;
    status: string;
    publishAt: string | null;
    lastPublishedAt: string | null;
    version: number;
    updatedAt: string;
    tags: string[];
    coverSlot: string | null;
    coverMediaId?: string | null;
    coverAltOverride?: string | null;
  };
  coverMedia?: {
    id: string;
    publicId: string;
    width: number;
    height: number;
    alt: string | null;
    decorative: boolean;
    blurDataUrl: string | null;
    displayName: string;
  } | null;
  workingCopy: {
    data: PostWorkingCopyData;
    baseVersion: number;
    updatedAt: string;
    updatedAtIst: string;
  } | null;
  revisions: RevisionItem[];
  categories: { slug: string; label: string }[];
  baseOwnerPath?: string;
  postsListHref?: string;
}

type InspectorTab = "editorial" | "publishing" | "seo";

export function PostEditorClient({
  post,
  coverMedia,
  workingCopy,
  revisions: initialRevisions,
  categories,
  baseOwnerPath,
  postsListHref,
}: PostEditorClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Navigation & View Layout State
  const [mobileTab, setMobileTab] = useState<"write" | "settings">("write");
  const [showInspector, setShowInspector] = useState(true);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("editorial");

  // Cover Image & Media State
  const [coverMediaId, setCoverMediaId] = useState<string | null>(post.coverMediaId || null);
  const [currentCoverMedia, setCurrentCoverMedia] = useState(coverMedia || null);
  const [coverAltOverride, setCoverAltOverride] = useState<string>(post.coverAltOverride || "");
  const [cropRatio, setCropRatio] = useState<"16/10" | "og">("16/10");
  const [publishWithoutCover, setPublishWithoutCover] = useState<boolean>(!post.coverMediaId && !post.coverSlot);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"editor" | "cover" | "legacy" | null>(null);
  const [isVideoPickerOpen, setIsVideoPickerOpen] = useState(false);
  const replaceLegacyNodeRef = useRef<((media: SelectedMediaPayload) => void) | null>(null);

  const handleInsertVideo = (videoPayload: SelectedVideoPayload) => {
    editor
      ?.chain()
      .focus()
      .insertContent({
        type: "youtube",
        attrs: {
          videoId: videoPayload.videoId,
          title: videoPayload.title,
          thumbnailUrl: videoPayload.thumbnailUrl,
          youtubeId: videoPayload.youtubeId,
          status: videoPayload.status,
        },
      })
      .run();
  };
  const [isEditorUploading, setIsEditorUploading] = useState(false);

  // Editor Form Fields
  const [title, setTitle] = useState(post.title);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [slug, setSlug] = useState(post.slug);
  const [categorySlug, setCategorySlug] = useState(post.categorySlug || categories[0]?.slug || "");
  const [authorName, setAuthorName] = useState(post.authorName || "Clinic Editorial Team");
  const [authorRole, setAuthorRole] = useState(post.authorRole || "Dental Health Communications");
  const [reviewedByDoctorSlug, setReviewedByDoctorSlug] = useState(post.reviewedByDoctorSlug || "");
  const [relatedServiceSlug, setRelatedServiceSlug] = useState(post.relatedServiceSlug || "");
  const [seoTitle, setSeoTitle] = useState(post.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(post.seoDescription || "");
  const [featured, setFeatured] = useState(post.featured);
  const [tags, setTags] = useState<string[]>(post.tags || []);
  const [tagInput, setTagInput] = useState("");

  // Post Meta
  const [version, setVersion] = useState(post.version);
  const [status, setStatus] = useState(post.status);
  const [publishAt, setPublishAt] = useState<string | null>(post.publishAt);

  // Status & Save indicator
  const [saveIndicator, setSaveIndicator] = useState<string>("All changes saved");
  const [isDirty, setIsDirty] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modals & Panels
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkError, setLinkError] = useState("");

  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showRevisions, setShowRevisions] = useState(false);
  const [previewRevision, setPreviewRevision] = useState<RevisionItem | null>(null);

  // Conflict Modal
  const [conflictModal, setConflictModal] = useState<string | null>(null);

  // Schedule Modal
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("10:00");
  const [scheduleError, setScheduleError] = useState("");

  // Working copy recovery banner
  const [recoveryBanner, setRecoveryBanner] = useState<{
    timeIst: string;
    data: PostWorkingCopyData;
  } | null>(() => {
    if (workingCopy && workingCopy.baseVersion === post.version) {
      return { timeIst: workingCopy.updatedAtIst, data: workingCopy.data };
    }
    return null;
  });

  const showToastMsg = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // TipTap Instance
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        strike: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        link: false,
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Placeholder.configure({
        placeholder: "Write your clinical article, guidance, or dental overview here...",
      }),
      CharacterCount,
      Callout,
      LegacyImage,
      ImageNode,
      VideoNode,
    ],
    content: blocksToEditorDoc(post.content),
    editorProps: {
      transformPastedHTML(html) {
        return sanitizePastedHtml(html);
      },
      handleDrop(view, event) {
        if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
          const file = event.dataTransfer.files[0];
          if (["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
            event.preventDefault();
            handleDirectImageUpload(file);
            return true;
          }
        }
        return false;
      },
      handlePaste(view, event) {
        if (event.clipboardData?.files && event.clipboardData.files.length > 0) {
          const file = event.clipboardData.files[0];
          if (["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
            event.preventDefault();
            handleDirectImageUpload(file);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: () => {
      setIsDirty(true);
      setSaveIndicator("Unsaved changes");
    },
  });

  // Direct Drag-and-Drop and Paste Upload
  const handleDirectImageUpload = async (file: File) => {
    if (!editor) return;
    setIsEditorUploading(true);
    showToastMsg("Processing & uploading image...");

    try {
      const { blob } = await clientResizeImage(file, {
        maxWidth: 2400,
        maxHeight: 2400,
        quality: 0.85,
      });

      const formData = new FormData();
      formData.append("file", blob, file.name.replace(/\.[^/.]+$/, ".webp"));
      formData.append("confirmedRights", "true");

      const uploaded = await uploadMediaAction(formData);
      editor.commands.insertContent({
        type: "image",
        attrs: {
          mediaId: uploaded.id,
          publicId: uploaded.publicId,
          width: uploaded.width,
          height: uploaded.height,
          alt: uploaded.alt || undefined,
          layout: "normal",
        },
      });
      showToastMsg("Image added to document");
    } catch (err) {
      showToastMsg(err instanceof Error ? err.message : "Failed to upload image", "error");
    } finally {
      setIsEditorUploading(false);
    }
  };

  // Listener for LegacyImage node replacement
  useEffect(() => {
    const handleReplace = (e: Event) => {
      const customEvent = e as CustomEvent<{
        replaceNode: (media: SelectedMediaPayload) => void;
      }>;
      if (customEvent.detail?.replaceNode) {
        replaceLegacyNodeRef.current = customEvent.detail.replaceNode;
        setMediaPickerTarget("legacy");
      }
    };

    window.addEventListener("guruom:replace-legacy-image", handleReplace);
    return () => window.removeEventListener("guruom:replace-legacy-image", handleReplace);
  }, []);

  // Track editor changes for autosave
  const getEditorData = useCallback((): PostEditorData => {
    let blocks = editor ? editorDocToBlocks(editor.getJSON()) : post.content;
    if (!blocks || blocks.length === 0) {
      blocks = [{ type: "paragraph", runs: [{ text: " " }] }];
    }
    return {
      title,
      excerpt,
      content: blocks,
      categorySlug,
      authorName,
      authorRole,
      reviewedByDoctorSlug: reviewedByDoctorSlug || null,
      relatedServiceSlug: relatedServiceSlug || null,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      featured,
      slug,
      tags,
      coverSlot: post.coverSlot || null,
      coverMediaId: coverMediaId || null,
      coverAltOverride: coverAltOverride.trim() || null,
    };
  }, [
    editor,
    title,
    excerpt,
    categorySlug,
    authorName,
    authorRole,
    reviewedByDoctorSlug,
    relatedServiceSlug,
    seoTitle,
    seoDescription,
    featured,
    slug,
    tags,
    post.coverSlot,
    post.content,
    coverMediaId,
    coverAltOverride,
  ]);

  // AUTOSAVE LOGIC (2s debounce, 30s forced dirty interval)
  const lastSaveTimeRef = useRef<number>(0);
  const isSavingRef = useRef(false);

  // Directly commits post data to database and returns updated version number
  const commitPostData = useCallback(async (customData?: PostEditorData): Promise<number> => {
    setSaveIndicator("Committing...");
    const data = customData || getEditorData();
    const res = await savePostAction(post.id, data, version);
    setVersion(res.version);
    setIsDirty(false);
    const timeStr = formatUtcToIst(new Date(), { timeStyle: "short" });
    setSaveIndicator(`Saved ${timeStr}`);
    localStorage.removeItem(`guruom_draft_${post.id}`);
    return res.version;
  }, [getEditorData, post.id, version, setSaveIndicator, setVersion, setIsDirty]);

  // MANUAL SAVE (Commits live row and creates revision)
  const handleManualSave = useCallback(async () => {
    startTransition(async () => {
      try {
        const newVer = await commitPostData();
        showToastMsg(`Committed version v${newVer}`);
        router.refresh();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Save failed";
        if (msg.includes("CONFLICT")) {
          setConflictModal(msg);
        } else {
          showToastMsg(msg, "error");
          setSaveIndicator("Commit failed");
        }
      }
    });
  }, [commitPostData, router]);

  const performAutosave = useCallback(async () => {
    if (!isDirty || isSavingRef.current) return;
    isSavingRef.current = true;
    setSaveIndicator("Saving...");

    const data = getEditorData();

    try {
      const res = await autosaveWorkingCopyAction(post.id, data, version);
      if (res.success) {
        setIsDirty(false);
        const timeStr = formatUtcToIst(new Date(res.updatedAt), { timeStyle: "short" });
        setSaveIndicator(`Saved ${timeStr}`);
        localStorage.removeItem(`guruom_draft_${post.id}`);
      }
    } catch {
      // Offline fallback: save to localStorage
      try {
        localStorage.setItem(`guruom_draft_${post.id}`, JSON.stringify(data));
        setSaveIndicator("Offline, saved locally");
      } catch {
        setSaveIndicator("Save failed");
      }
    } finally {
      isSavingRef.current = false;
      lastSaveTimeRef.current = Date.now();
    }
  }, [isDirty, getEditorData, post.id, version, setSaveIndicator, setIsDirty]);

  useEffect(() => {
    if (!isDirty) return;

    // 2-second debounce
    const debounceTimer = setTimeout(() => {
      performAutosave();
    }, 2000);

    // 30-second forced interval
    const intervalTimer = setInterval(() => {
      if (Date.now() - lastSaveTimeRef.current >= 30000) {
        performAutosave();
      }
    }, 10000);

    return () => {
      clearTimeout(debounceTimer);
      clearInterval(intervalTimer);
    };
  }, [isDirty, performAutosave]);

  // In-app & browser unload warnings
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Keyboard Shortcuts (Ctrl+S, Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleManualSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setLinkUrl(editor?.getAttributes("link").href || "");
        setLinkError("");
        setShowLinkDialog(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editor, handleManualSave]);

  // Media Picker Selection Handler
  const handleMediaPickerSelect = (selected: SelectedMediaPayload) => {
    if (mediaPickerTarget === "editor") {
      editor?.commands.insertContent({
        type: "image",
        attrs: {
          mediaId: selected.id,
          publicId: selected.publicId,
          width: selected.width,
          height: selected.height,
          alt: selected.alt || undefined,
          layout: "normal",
        },
      });
      showToastMsg("Image inserted into article");
    } else if (mediaPickerTarget === "cover") {
      setCoverMediaId(selected.id);
      setCurrentCoverMedia({
        id: selected.id,
        publicId: selected.publicId,
        width: selected.width,
        height: selected.height,
        alt: selected.alt,
        decorative: selected.decorative,
        blurDataUrl: null,
        displayName: selected.displayName,
      });
      setIsDirty(true);
      showToastMsg("Cover image selected");
    } else if (mediaPickerTarget === "legacy" && replaceLegacyNodeRef.current) {
      replaceLegacyNodeRef.current(selected);
      replaceLegacyNodeRef.current = null;
      showToastMsg("Legacy image replaced");
    }
    setMediaPickerTarget(null);
  };

  // PUBLISH NOW ACTION
  const handlePublishNow = async () => {
    const cleanTitle = title.trim();
    if (!cleanTitle || cleanTitle === "Untitled Draft") {
      showToastMsg("An article title is required before publishing.", "error");
      return;
    }
    if (!excerpt.trim()) {
      showToastMsg("An editorial summary/excerpt is required before publishing.", "error");
      return;
    }
    if (!categorySlug) {
      showToastMsg("Please select a primary category before publishing.", "error");
      return;
    }

    // Cover check
    if (!coverMediaId && !post.coverSlot && !publishWithoutCover) {
      showToastMsg("Please select a cover image or check 'Allow publishing without cover'.", "error");
      return;
    }

    // Cover alt text check
    if (coverMediaId) {
      const effectiveCoverAlt = coverAltOverride.trim() || currentCoverMedia?.alt;
      if (!effectiveCoverAlt && !currentCoverMedia?.decorative) {
        showToastMsg("Cover image is missing alt text. Please provide alt text before publishing.", "error");
        return;
      }
    }

    // Inline image alt text check
    const blocks = editor ? editorDocToBlocks(editor.getJSON()) : post.content;
    for (const b of blocks) {
      if (b.type === "image" && "mediaId" in b && !b.alt) {
        showToastMsg("An inline image is missing alt text. Please provide alt text before publishing.", "error");
        return;
      }
    }

    startTransition(async () => {
      try {
        await commitPostData();
        await publishNowAction(post.id);
        setStatus("published");
        showToastMsg("Post published live!");
        router.refresh();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Publish failed";
        if (msg.includes("CONFLICT")) {
          setConflictModal(msg);
        } else {
          showToastMsg(msg, "error");
        }
      }
    });
  };

  // SCHEDULE ACTION
  const handleScheduleSubmit = async () => {
    const cleanTitle = title.trim();
    if (!cleanTitle || cleanTitle === "Untitled Draft") {
      setScheduleError("An article title is required before scheduling.");
      return;
    }
    if (!excerpt.trim()) {
      setScheduleError("An excerpt is required before scheduling.");
      return;
    }
    if (!categorySlug) {
      setScheduleError("Please select a category before scheduling.");
      return;
    }
    if (!scheduleDate) {
      setScheduleError("Please select a date.");
      return;
    }

    let utcTarget: Date;
    try {
      utcTarget = istInputToUtc(scheduleDate, scheduleTime);
    } catch (e: unknown) {
      setScheduleError(e instanceof Error ? e.message : "Invalid date/time");
      return;
    }

    const validation = validateScheduleDate(utcTarget);
    if (!validation.valid) {
      setScheduleError(validation.error || "Invalid schedule date");
      return;
    }

    startTransition(async () => {
      try {
        await commitPostData();
        await schedulePostAction(post.id, utcTarget.toISOString());
        setStatus("scheduled");
        setPublishAt(utcTarget.toISOString());
        setShowScheduleDialog(false);
        showToastMsg("Post scheduled successfully!");
        router.refresh();
      } catch (err) {
        setScheduleError(err instanceof Error ? err.message : "Failed to schedule post");
      }
    });
  };

  const handleUnschedule = async () => {
    startTransition(async () => {
      try {
        await unschedulePostAction(post.id);
        setStatus("draft");
        setPublishAt(null);
        showToastMsg("Post unscheduled and reverted to draft.");
        router.refresh();
      } catch (err) {
        showToastMsg(err instanceof Error ? err.message : "Unschedule failed", "error");
      }
    });
  };

  const handleUnpublish = async () => {
    startTransition(async () => {
      try {
        await unpublishPostAction(post.id);
        setStatus("draft");
        showToastMsg("Post unpublished and moved to drafts.");
        router.refresh();
      } catch (err) {
        showToastMsg(err instanceof Error ? err.message : "Unpublish failed", "error");
      }
    });
  };

  // Tag Management
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^,+|,+$/g, "");
      if (clean && !tags.includes(clean) && tags.length < 8) {
        setTags([...tags, clean.slice(0, 30)]);
        setTagInput("");
        setIsDirty(true);
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
    setIsDirty(true);
  };

  // Link Dialog submit
  const applyLink = () => {
    if (!linkUrl.trim()) {
      editor?.chain().focus().unsetLink().run();
      setShowLinkDialog(false);
      return;
    }

    if (!isSafeLink(linkUrl)) {
      setLinkError("Links must begin with https://, mailto:, tel:, or /relative");
      return;
    }

    editor
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: linkUrl.trim() })
      .run();
    setShowLinkDialog(false);
    setLinkUrl("");
    setLinkError("");
  };

  // Restore working copy from recovery banner
  const restoreWorkingCopy = () => {
    if (!recoveryBanner?.data) return;
    const d = recoveryBanner.data;
    if (d.title) setTitle(d.title);
    if (d.excerpt) setExcerpt(d.excerpt);
    if (d.slug) setSlug(d.slug);
    if (d.categorySlug) setCategorySlug(d.categorySlug);
    if (d.authorName) setAuthorName(d.authorName);
    if (d.authorRole) setAuthorRole(d.authorRole);
    if (d.tags) setTags(d.tags);
    if (d.coverMediaId) setCoverMediaId(d.coverMediaId as string);
    if (d.coverAltOverride) setCoverAltOverride(d.coverAltOverride as string);
    if (d.content && editor) {
      editor.commands.setContent(blocksToEditorDoc(d.content));
    }
    setRecoveryBanner(null);
    setIsDirty(true);
    showToastMsg("Restored unsaved changes into editor.");
  };

  const discardWorkingCopy = () => {
    setRecoveryBanner(null);
    localStorage.removeItem(`guruom_draft_${post.id}`);
  };

  // Restore snapshot from revisions drawer
  const restoreRevisionSnapshot = (rev: RevisionItem) => {
    if (!rev.snapshot) return;
    const s = rev.snapshot;
    if (typeof s.title === "string") setTitle(s.title);
    if (typeof s.excerpt === "string") setExcerpt(s.excerpt);
    if (typeof s.categorySlug === "string") setCategorySlug(s.categorySlug);
    if (Array.isArray(s.content) && editor) {
      editor.commands.setContent(blocksToEditorDoc(s.content as ContentBlock[]));
    }
    setPreviewRevision(null);
    setShowRevisions(false);
    setIsDirty(true);
    showToastMsg("Restored revision into working copy. Click Save to commit.");
  };

  const currentBlocks = editor ? editorDocToBlocks(editor.getJSON()) : post.content;
  const wordCount = editor?.storage.characterCount.words() || 0;
  const readingTime = calculateReadingTimeMinutes(currentBlocks);

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body selection:bg-brand/10 selection:text-ink">
      {/* Apple Dynamic Island / Floating Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-2xl flex items-center gap-2.5 text-xs font-medium transition-all animate-in fade-in slide-in-from-top-3 ${
            toast.type === "error"
              ? "bg-rose-950/90 text-rose-100 border border-rose-500/30"
              : "bg-ink/90 text-white border border-white/10"
          }`}
        >
          {toast.type === "error" ? (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Apple Style Recovery Notification Banner */}
      {recoveryBanner && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 sm:px-6 py-2.5 backdrop-blur-md sticky top-0 z-40 transition-all">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-amber-950">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-medium">
                Unsaved working copy detected from{" "}
                <span className="font-semibold">{recoveryBanner.timeIst}</span>. Would you like to restore it?
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={restoreWorkingCopy}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-lg font-medium text-xs transition-all shadow-xs"
              >
                Restore Edits
              </button>
              <button
                type="button"
                onClick={discardWorkingCopy}
                className="px-3 py-1.5 bg-white/80 hover:bg-white active:scale-95 border border-amber-300 text-amber-900 rounded-lg font-medium text-xs transition-all"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apple Unified Navigation & Action Toolbar */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-black/[0.06] transition-all">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
          {/* Left: Back & Document Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={postsListHref || (baseOwnerPath ? `${baseOwnerPath}/posts` : "/ow/posts")}
              className="w-9 h-9 rounded-full border border-black/[0.08] bg-white/90 hover:bg-white text-ink inline-flex items-center justify-center transition-all hover:shadow-xs active:scale-95 shrink-0"
              title="Return to Articles"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display font-semibold text-ink text-sm sm:text-base truncate max-w-[180px] sm:max-w-xs md:max-w-md">
                  {title || "Untitled Publication"}
                </h1>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-black/[0.05] text-ink-muted border border-black/[0.04]">
                  v{version}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-ink-muted">
                {/* Apple Status Capsule with Dot */}
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                    status === "published"
                      ? "bg-emerald-500/10 text-emerald-700"
                      : status === "scheduled"
                      ? "bg-amber-500/10 text-amber-700"
                      : "bg-sky-500/10 text-sky-700"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      status === "published"
                        ? "bg-emerald-500"
                        : status === "scheduled"
                        ? "bg-amber-500"
                        : "bg-sky-500"
                    }`}
                  />
                  <span>{status}</span>
                </span>
                <span>•</span>
                <span className="truncate flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      isDirty ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                    }`}
                  />
                  <span>{saveIndicator}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Center: Mobile Segmented Switch */}
          <div className="flex sm:hidden items-center p-0.5 bg-black/[0.06] rounded-xl">
            <button
              type="button"
              onClick={() => setMobileTab("write")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                mobileTab === "write" ? "bg-white text-ink shadow-xs" : "text-ink-muted"
              }`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("settings")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                mobileTab === "settings" ? "bg-white text-ink shadow-xs" : "text-ink-muted"
              }`}
            >
              Inspector
            </button>
          </div>

          {/* Right: Actions & Tools */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Inspector Toggle (Mac / iPad style) */}
            <button
              type="button"
              onClick={() => setShowInspector(!showInspector)}
              title={showInspector ? "Hide Inspector" : "Show Inspector"}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 border ${
                showInspector
                  ? "bg-black/10 border-black/[0.08] text-ink shadow-2xs font-semibold"
                  : "bg-black/[0.02] border-black/[0.05] text-ink-muted hover:text-ink hover:bg-black/[0.05]"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Inspector</span>
            </button>

            {/* Shortcuts */}
            <button
              type="button"
              onClick={() => setShowShortcuts(!showShortcuts)}
              title="Keyboard Shortcuts"
              className="w-8 h-8 rounded-full inline-flex items-center justify-center text-ink-muted hover:text-ink hover:bg-black/[0.04] transition-colors active:scale-95"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>

            {/* Preview */}
            <Link
              href={`${baseOwnerPath || "/ow"}/posts/${post.id}/preview`}
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/[0.08] bg-white hover:bg-surface text-xs font-medium text-ink transition-all hover:shadow-xs active:scale-95"
            >
              <Eye className="w-3.5 h-3.5 text-ink-muted" />
              <span>Preview</span>
            </Link>

            {/* Manual Save */}
            <button
              type="button"
              onClick={handleManualSave}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/[0.08] bg-white hover:bg-surface text-xs font-medium text-ink transition-all hover:shadow-xs active:scale-95 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-ink-muted" />
              ) : (
                <Save className="w-3.5 h-3.5 text-ink-muted" />
              )}
              <span>Save</span>
            </button>

            {/* Publish / Update Action */}
            {status === "published" ? (
              <button
                type="button"
                onClick={handleManualSave}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-ink text-white text-xs font-medium hover:bg-brand-dark transition-all shadow-xs active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Update Live</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePublishNow}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent text-on-accent font-semibold text-xs hover:bg-accent-deep hover:text-white transition-all shadow-xs active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-start gap-6 lg:gap-8 justify-center">
        {/* Left Column: Apple Document Writing Canvas */}
        <div
          className={`flex-1 min-w-0 transition-all duration-300 ${
            mobileTab === "settings" ? "hidden sm:flex flex-col" : "flex flex-col"
          }`}
        >
          {/* Centered Document Sheet */}
          <main className="max-w-4xl mx-auto w-full bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03),0_8px_32px_-4px_rgba(0,0,0,0.04)] border border-black/[0.05] p-6 sm:p-10 lg:p-14 space-y-6">
            {/* Title Input - Frameless Apple Typography */}
            <div>
              <label htmlFor="post-title" className="sr-only">
                Article Title
              </label>
              <input
                id="post-title"
                type="text"
                value={title}
                maxLength={160}
                placeholder="Title of Clinical Article..."
                onChange={(e) => {
                  setTitle(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-ink bg-transparent border-0 focus:outline-hidden p-0 placeholder:text-ink-muted/30 tracking-tight leading-tight"
              />
              <div className="flex justify-end pt-1">
                <span className="text-[10px] font-mono text-ink-muted/60">{title.length} / 160</span>
              </div>
            </div>

            {/* Excerpt Input - Apple Editorial Subtitle */}
            <div className="border-b border-black/[0.05] pb-4">
              <label htmlFor="post-excerpt" className="sr-only">
                Article Subtitle or Summary
              </label>
              <textarea
                id="post-excerpt"
                rows={2}
                maxLength={320}
                value={excerpt}
                placeholder="Add a concise subtitle or summary for readers..."
                onChange={(e) => {
                  setExcerpt(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full text-sm sm:text-base text-ink-muted placeholder:text-ink-muted/35 bg-transparent border-0 p-0 focus:outline-hidden resize-none leading-relaxed"
              />
            </div>

            {/* Apple Style Floating Capsule Formatting Toolbar */}
            <div
              role="toolbar"
              aria-label="Editor formatting toolbar"
              className="sticky top-14 z-20 backdrop-blur-xl bg-white/90 border border-black/[0.06] shadow-[0_4px_16px_-2px_rgba(0,0,0,0.06)] rounded-full px-2 py-1 mx-auto w-fit max-w-full flex items-center gap-0.5 overflow-x-auto no-scrollbar transition-all"
            >
              {/* Headings */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`w-7.5 h-7.5 rounded-full inline-flex items-center justify-center transition-all ${
                  editor?.isActive("heading", { level: 2 })
                    ? "bg-black/10 text-ink shadow-2xs font-semibold"
                    : "text-ink-muted/80 hover:text-ink hover:bg-black/[0.04]"
                }`}
                title="Heading 2"
                aria-pressed={editor?.isActive("heading", { level: 2 })}
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`w-7.5 h-7.5 rounded-full inline-flex items-center justify-center transition-all ${
                  editor?.isActive("heading", { level: 3 })
                    ? "bg-black/10 text-ink shadow-2xs font-semibold"
                    : "text-ink-muted/80 hover:text-ink hover:bg-black/[0.04]"
                }`}
                title="Heading 3"
                aria-pressed={editor?.isActive("heading", { level: 3 })}
              >
                <Heading3 className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-3.5 bg-black/[0.08] mx-0.5 shrink-0" />

              {/* Inlines */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`w-7.5 h-7.5 rounded-full inline-flex items-center justify-center transition-all ${
                  editor?.isActive("bold")
                    ? "bg-black/10 text-ink shadow-2xs font-semibold"
                    : "text-ink-muted/80 hover:text-ink hover:bg-black/[0.04]"
                }`}
                title="Bold (Ctrl+B)"
                aria-pressed={editor?.isActive("bold")}
              >
                <Bold className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`w-7.5 h-7.5 rounded-full inline-flex items-center justify-center transition-all ${
                  editor?.isActive("italic")
                    ? "bg-black/10 text-ink shadow-2xs font-semibold"
                    : "text-ink-muted/80 hover:text-ink hover:bg-black/[0.04]"
                }`}
                title="Italic (Ctrl+I)"
                aria-pressed={editor?.isActive("italic")}
              >
                <Italic className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setLinkUrl(editor?.getAttributes("link").href || "");
                  setLinkError("");
                  setShowLinkDialog(true);
                }}
                className={`w-7.5 h-7.5 rounded-full inline-flex items-center justify-center transition-all ${
                  editor?.isActive("link")
                    ? "bg-black/10 text-ink shadow-2xs font-semibold"
                    : "text-ink-muted/80 hover:text-ink hover:bg-black/[0.04]"
                }`}
                title="Insert Safe Link (Ctrl+K)"
                aria-pressed={editor?.isActive("link")}
              >
                <LinkIcon className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-3.5 bg-black/[0.08] mx-0.5 shrink-0" />

              {/* Lists & Quotes */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`w-7.5 h-7.5 rounded-full inline-flex items-center justify-center transition-all ${
                  editor?.isActive("bulletList")
                    ? "bg-black/10 text-ink shadow-2xs font-semibold"
                    : "text-ink-muted/80 hover:text-ink hover:bg-black/[0.04]"
                }`}
                title="Bullet List"
                aria-pressed={editor?.isActive("bulletList")}
              >
                <List className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                className={`w-7.5 h-7.5 rounded-full inline-flex items-center justify-center transition-all ${
                  editor?.isActive("orderedList")
                    ? "bg-black/10 text-ink shadow-2xs font-semibold"
                    : "text-ink-muted/80 hover:text-ink hover:bg-black/[0.04]"
                }`}
                title="Numbered List"
                aria-pressed={editor?.isActive("orderedList")}
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                className={`w-7.5 h-7.5 rounded-full inline-flex items-center justify-center transition-all ${
                  editor?.isActive("blockquote")
                    ? "bg-black/10 text-ink shadow-2xs font-semibold"
                    : "text-ink-muted/80 hover:text-ink hover:bg-black/[0.04]"
                }`}
                title="Quote"
                aria-pressed={editor?.isActive("blockquote")}
              >
                <Quote className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleCallout({ tone: "tip", title: "Pro Tip" }).run()}
                className={`w-7.5 h-7.5 rounded-full inline-flex items-center justify-center transition-all ${
                  editor?.isActive("callout")
                    ? "bg-black/10 text-ink shadow-2xs font-semibold"
                    : "text-ink-muted/80 hover:text-ink hover:bg-black/[0.04]"
                }`}
                title="Callout Box"
                aria-pressed={editor?.isActive("callout")}
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-3.5 bg-black/[0.08] mx-0.5 shrink-0" />

              {/* Media Image Upload */}
              <button
                type="button"
                onClick={() => setMediaPickerTarget("editor")}
                className="w-7.5 h-7.5 rounded-full inline-flex items-center justify-center text-ink-muted/80 hover:text-ink hover:bg-black/[0.04] transition-all"
                title="Insert Image (Cloudinary Media)"
              >
                <ImageIcon className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsVideoPickerOpen(true)}
                className="w-7.5 h-7.5 rounded-full inline-flex items-center justify-center text-ink-muted/80 hover:text-ink hover:bg-black/[0.04] transition-all cursor-pointer"
                title="Embed YouTube Video"
              >
                <Video className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-3.5 bg-black/[0.08] mx-0.5 shrink-0" />

              {/* History Undo/Redo */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().undo().run()}
                disabled={!editor?.can().undo()}
                className="w-7.5 h-7.5 rounded-full inline-flex items-center justify-center text-ink-muted/80 hover:text-ink hover:bg-black/[0.04] disabled:opacity-25 transition-all"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => editor?.chain().focus().redo().run()}
                disabled={!editor?.can().redo()}
                className="w-7.5 h-7.5 rounded-full inline-flex items-center justify-center text-ink-muted/80 hover:text-ink hover:bg-black/[0.04] disabled:opacity-25 transition-all"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>

              {isEditorUploading && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] font-medium ml-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Uploading...</span>
                </div>
              )}
            </div>

            {/* TipTap Editor ProseMirror Canvas */}
            <div
              className="pt-2 min-h-[460px] cursor-text"
              onClick={() => editor?.commands.focus()}
            >
              <EditorContent editor={editor} />
            </div>

            {/* Document Footer Stats (Apple HIG Status Capsule) */}
            <div className="pt-6 border-t border-black/[0.05] flex items-center justify-between text-[11px] text-ink-muted">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-ink-muted" />
                  {wordCount} words
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-ink-muted" />
                  ~{readingTime} min read
                </span>
                <span>•</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/[0.04] text-ink-muted border border-black/[0.03]">
                  Schema v2
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${isDirty ? "bg-amber-500" : "bg-emerald-500"}`} />
                <span className="font-medium">{saveIndicator}</span>
              </div>
            </div>
          </main>
        </div>

        {/* Right Column: Apple Inspector Pane */}
        {showInspector && (
          <aside
            className={`w-full sm:w-80 lg:w-88 xl:w-96 shrink-0 space-y-4 transition-all duration-300 ${
              mobileTab === "write" ? "hidden sm:block" : "block"
            }`}
          >
            {/* Apple Segmented Tabs for Inspector */}
            <div className="p-1 bg-black/[0.04] rounded-full flex items-center gap-0.5 border border-black/[0.04] shadow-[inset_0_1px_1px_rgba(0,0,0,0.02)]">
              {[
                { id: "editorial", label: "Document" },
                { id: "publishing", label: "Publishing" },
                { id: "seo", label: "SEO" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setInspectorTab(tab.id as InspectorTab)}
                  className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-full transition-all text-center select-none ${
                    inspectorTab === tab.id
                      ? "bg-white text-ink shadow-[0_1px_2.5px_rgba(0,0,0,0.08),0_0.5px_1px_rgba(0,0,0,0.04)] font-semibold"
                      : "text-ink-muted/80 hover:text-ink hover:bg-black/[0.03]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* CARD 1: Status & Publishing (Shown on "publishing") */}
            {inspectorTab === "publishing" && (
              <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl p-4.5 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold tracking-wider text-black/50 uppercase">
                    Publish Status
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      status === "published"
                        ? "bg-emerald-500/10 text-emerald-700"
                        : status === "scheduled"
                        ? "bg-amber-500/10 text-amber-700"
                        : "bg-sky-500/10 text-sky-700"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        status === "published"
                          ? "bg-emerald-500"
                          : status === "scheduled"
                          ? "bg-amber-500"
                          : "bg-sky-500"
                      }`}
                    />
                    {status}
                  </span>
                </div>

                {status === "published" && (
                  <div className="p-3 bg-surface/60 rounded-xl border border-black/[0.04] text-[11px] text-ink-muted leading-relaxed">
                    This publication is live for patients. Autosave updates your working draft; click{" "}
                    <span className="font-semibold text-ink">Update Live</span> to deploy public changes.
                  </div>
                )}

                {status === "scheduled" && publishAt && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                    <p className="text-xs font-semibold text-amber-950 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Scheduled Publication</span>
                    </p>
                    <p className="text-xs text-amber-900 font-medium">{formatUtcToIst(publishAt)}</p>
                    <p className="text-[11px] text-amber-700 italic">
                      Goes live {formatRelativeTime(publishAt)}
                    </p>
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowScheduleDialog(true)}
                    disabled={isPending}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-black/[0.08] bg-white hover:bg-surface text-xs font-semibold text-ink transition-all hover:shadow-xs active:scale-95 disabled:opacity-50"
                  >
                    <Calendar className="w-3.5 h-3.5 text-brand" />
                    <span>{status === "scheduled" ? "Reschedule Publication" : "Schedule Publication"}</span>
                  </button>

                  {status === "scheduled" && (
                    <button
                      type="button"
                      onClick={handleUnschedule}
                      disabled={isPending}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-amber-800 hover:bg-amber-50 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Unschedule (Revert to Draft)</span>
                    </button>
                  )}

                  {status === "published" && (
                    <button
                      type="button"
                      onClick={handleUnpublish}
                      disabled={isPending}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-700 hover:bg-rose-50 transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Unpublish to Draft</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowRevisions(true)}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-black/[0.08] bg-white hover:bg-surface text-xs font-medium text-ink transition-all hover:shadow-xs active:scale-95"
                  >
                    <History className="w-3.5 h-3.5 text-ink-muted" />
                    <span>Revisions ({initialRevisions.length})</span>
                  </button>
                </div>
              </div>
            )}

            {/* CARD 2: Cover Image & Social Card */}
            {inspectorTab === "editorial" && (
              <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl p-4.5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold tracking-wider text-black/50 uppercase block">
                    Cover Image
                  </span>
                  {currentCoverMedia && (
                    <div className="flex items-center p-0.5 bg-surface rounded-lg text-[10px]">
                      <button
                        type="button"
                        onClick={() => setCropRatio("16/10")}
                        className={`px-2 py-0.5 rounded font-medium transition-colors ${
                          cropRatio === "16/10"
                            ? "bg-white shadow-xs font-semibold text-ink"
                            : "text-ink-muted hover:text-ink"
                        }`}
                      >
                        16:10
                      </button>
                      <button
                        type="button"
                        onClick={() => setCropRatio("og")}
                        className={`px-2 py-0.5 rounded font-medium transition-colors ${
                          cropRatio === "og"
                            ? "bg-white shadow-xs font-semibold text-ink"
                            : "text-ink-muted hover:text-ink"
                        }`}
                      >
                        1.91:1
                      </button>
                    </div>
                  )}
                </div>

                {currentCoverMedia ? (
                  <div className="space-y-3">
                    {/* Dual Crop Preview */}
                    <div
                      className={`relative w-full rounded-xl overflow-hidden border border-line bg-surface-alt ${
                        cropRatio === "16/10" ? "aspect-[16/10]" : "aspect-[1200/630]"
                      }`}
                    >
                      <Image
                        loader={cloudinaryLoader}
                        src={currentCoverMedia.publicId}
                        alt={coverAltOverride || currentCoverMedia.alt || "Cover preview"}
                        fill
                        sizes="320px"
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono backdrop-blur-xs">
                        {cropRatio === "16/10" ? "Card Crop (16:10)" : "Social Share (1.91:1)"}
                      </div>
                    </div>

                    <div className="text-[11px] text-ink-muted flex items-center justify-between">
                      <span className="truncate max-w-[180px] font-medium text-ink">
                        {currentCoverMedia.displayName}
                      </span>
                      <span>
                        {currentCoverMedia.width}×{currentCoverMedia.height}
                      </span>
                    </div>

                    {/* Alt Override Input */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-ink flex items-center justify-between">
                        <span>Cover Alt Text</span>
                        <span className="text-[10px] text-ink-muted">
                          {currentCoverMedia.alt ? `Asset: "${currentCoverMedia.alt.slice(0, 16)}..."` : "No asset alt"}
                        </span>
                      </label>
                      <input
                        type="text"
                        maxLength={200}
                        placeholder={currentCoverMedia.alt || "Describe cover image for accessibility..."}
                        value={coverAltOverride}
                        onChange={(e) => {
                          setCoverAltOverride(e.target.value);
                          setIsDirty(true);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-line bg-surface/50 text-ink focus:bg-white focus:ring-1 focus:ring-brand"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setMediaPickerTarget("cover")}
                        className="flex-1 py-1.5 rounded-xl border border-line bg-white hover:bg-surface text-xs font-semibold text-ink text-center transition-colors shadow-xs"
                      >
                        Change Cover
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCoverMediaId(null);
                          setCurrentCoverMedia(null);
                          setCoverAltOverride("");
                          setIsDirty(true);
                        }}
                        className="py-1.5 px-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 rounded-xl border-2 border-dashed border-line bg-surface/40 space-y-2">
                    <ImageIcon className="w-8 h-8 text-ink-muted/40 mx-auto" />
                    <div>
                      <p className="text-xs font-semibold text-ink">No cover image selected</p>
                      <p className="text-[11px] text-ink-muted mt-0.5">
                        Add a clinical or illustrative cover for cards and social previews.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMediaPickerTarget("cover")}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand text-white shadow-xs hover:bg-brand-dark transition-colors"
                    >
                      Choose Cover Image
                    </button>
                  </div>
                )}

                {/* Publish without cover checkbox */}
                <div className="pt-2 border-t border-black/[0.05] flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="publish-without-cover"
                    checked={publishWithoutCover}
                    onChange={(e) => setPublishWithoutCover(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-line text-brand focus:ring-brand accent-brand cursor-pointer"
                  />
                  <label
                    htmlFor="publish-without-cover"
                    className="text-xs text-ink/80 cursor-pointer select-none"
                  >
                    Allow publishing without cover image
                  </label>
                </div>
              </div>
            )}

            {/* CARD 3: Taxonomy & Tags (Shown on "editorial") */}
            {inspectorTab === "editorial" && (
              <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl p-4.5 space-y-4 shadow-xs">
                <span className="text-[11px] font-semibold tracking-wider text-black/50 uppercase block">
                  Category & Metadata
                </span>

                {/* Primary Category */}
                <div>
                  <label htmlFor="category-select" className="block text-xs font-medium text-ink mb-1.5">
                    Primary Category
                  </label>
                  <div className="relative">
                    <select
                      id="category-select"
                      value={categorySlug}
                      onChange={(e) => {
                        setCategorySlug(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full appearance-none px-3 py-2 text-xs rounded-xl border border-black/[0.08] bg-surface/50 text-ink focus:bg-white focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all outline-hidden cursor-pointer pr-8"
                    >
                      {categories.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="tags-input" className="text-xs font-medium text-ink flex items-center gap-1">
                      <TagIcon className="w-3 h-3 text-ink-muted" />
                      <span>Article Tags</span>
                    </label>
                    <span className="text-[10px] text-ink-muted font-mono">{tags.length} / 8</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-black/[0.04] border border-black/[0.04] text-ink"
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-rose-600 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {tags.length < 8 && (
                    <input
                      id="tags-input"
                      type="text"
                      value={tagInput}
                      placeholder="Add tag and press Enter..."
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-black/[0.08] bg-surface/50 text-ink focus:bg-white focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all outline-hidden placeholder:text-ink-muted/50"
                    />
                  )}
                </div>

                {/* Apple Style Fluid Toggle: Featured Publication */}
                <div className="pt-3 border-t border-black/[0.05]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-ink block">Featured Publication</span>
                      <span className="text-[11px] text-ink-muted leading-tight block">
                        Pin to hero slot in dental journal. Atomically replaces current featured post.
                      </span>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={featured}
                      onClick={() => {
                        const willFeature = !featured;
                        if (willFeature) {
                          const confirmFeature = window.confirm(
                            "Setting this as Featured will atomically replace the currently featured publication. Continue?"
                          );
                          if (confirmFeature) {
                            setFeatured(true);
                            setIsDirty(true);
                          }
                        } else {
                          setFeatured(false);
                          setIsDirty(true);
                        }
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                        featured ? "bg-accent" : "bg-black/15"
                      }`}
                    >
                      <span className="sr-only">Toggle featured publication</span>
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          featured ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CARD 3b: Authorship & Clinical Verification (Shown on "editorial") */}
            {inspectorTab === "editorial" && (
              <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl p-4.5 space-y-3.5 shadow-xs">
                <span className="text-[11px] font-semibold tracking-wider text-black/50 uppercase block">
                  Authorship & Clinical Review
                </span>

                <div>
                  <label htmlFor="author-name" className="block text-xs font-medium text-ink mb-1">
                    Author Name
                  </label>
                  <input
                    id="author-name"
                    type="text"
                    value={authorName}
                    onChange={(e) => {
                      setAuthorName(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-black/[0.08] bg-surface/50 text-ink focus:bg-white focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all outline-hidden"
                  />
                </div>

                <div>
                  <label htmlFor="author-role" className="block text-xs font-medium text-ink mb-1">
                    Author Role
                  </label>
                  <input
                    id="author-role"
                    type="text"
                    value={authorRole}
                    onChange={(e) => {
                      setAuthorRole(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-black/[0.08] bg-surface/50 text-ink focus:bg-white focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all outline-hidden"
                  />
                </div>

                <div>
                  <label htmlFor="reviewed-by-doctor" className="block text-xs font-medium text-ink mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand" />
                    <span>Clinically Reviewed By</span>
                  </label>
                  <div className="relative">
                    <select
                      id="reviewed-by-doctor"
                      value={reviewedByDoctorSlug}
                      onChange={(e) => {
                        setReviewedByDoctorSlug(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full appearance-none px-3 py-1.5 text-xs rounded-xl border border-black/[0.08] bg-surface/50 text-ink focus:bg-white focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all outline-hidden cursor-pointer pr-8"
                    >
                      <option value="">None (Unreviewed editorial)</option>
                      {doctorsData.map((d) => (
                        <option key={d.slug} value={d.slug}>
                          {d.name} ({d.role})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-ink-muted mt-1 italic">
                    Select doctor only after medical and clinical accuracy sign-off.
                  </p>
                </div>

                <div>
                  <label htmlFor="related-service" className="block text-xs font-medium text-ink mb-1">
                    Related Dental Service
                  </label>
                  <div className="relative">
                    <select
                      id="related-service"
                      value={relatedServiceSlug}
                      onChange={(e) => {
                        setRelatedServiceSlug(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full appearance-none px-3 py-1.5 text-xs rounded-xl border border-black/[0.08] bg-surface/50 text-ink focus:bg-white focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all outline-hidden cursor-pointer pr-8"
                    >
                      <option value="">None</option>
                      {servicesData.map((s) => (
                        <option key={s.slug} value={s.slug}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            {/* CARD 4: URL Slug & Permalinks (Shown on "publishing") */}
            {inspectorTab === "publishing" && (
              <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl p-4.5 space-y-3 shadow-xs">
                <span className="text-[11px] font-semibold tracking-wider text-black/50 uppercase block">
                  URL Slug & Redirects
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full px-3 py-1.5 text-xs font-mono rounded-xl border border-black/[0.08] bg-surface/50 text-ink focus:bg-white focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const generated = generateSlug(title);
                        setSlug(generated);
                        setIsDirty(true);
                      }}
                      title="Generate slug from title"
                      className="px-2.5 py-1.5 border border-black/[0.08] rounded-xl bg-white hover:bg-surface text-ink text-xs font-medium transition-all active:scale-95 shadow-xs"
                    >
                      Auto
                    </button>
                  </div>
                  <p className="text-[10px] text-ink-muted mt-1 leading-relaxed">
                    Altering this slug preserves history and applies automatic 308 redirects from the old URL.
                  </p>
                </div>
              </div>
            )}

            {/* CARD 5: Search Engine Optimization & SERP (Shown on "seo") */}
            {inspectorTab === "seo" && (
              <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl p-4.5 space-y-3.5 shadow-xs">
                <span className="text-[11px] font-semibold tracking-wider text-black/50 uppercase block">
                  Search Engine Optimization
                </span>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="seo-title" className="text-xs font-medium text-ink">
                      SEO Title
                    </label>
                    <span className="text-[10px] font-mono text-ink-muted/60">{seoTitle.length} / 160</span>
                  </div>
                  <input
                    id="seo-title"
                    type="text"
                    maxLength={160}
                    value={seoTitle}
                    placeholder={title || "Article title..."}
                    onChange={(e) => {
                      setSeoTitle(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-black/[0.08] bg-surface/50 text-ink focus:bg-white focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all outline-hidden"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="seo-description" className="text-xs font-medium text-ink">
                      SEO Description
                    </label>
                    <span className="text-[10px] font-mono text-ink-muted/60">{seoDescription.length} / 320</span>
                  </div>
                  <textarea
                    id="seo-description"
                    rows={2}
                    maxLength={320}
                    value={seoDescription}
                    placeholder={excerpt || "Article summary for search engines..."}
                    onChange={(e) => {
                      setSeoDescription(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-black/[0.08] bg-surface/50 text-ink focus:bg-white focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all outline-hidden resize-none leading-relaxed"
                  />
                </div>

                {/* Google Search Result Preview Card */}
                <div className="bg-surface/70 border border-black/[0.04] rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-ink-muted uppercase tracking-wider mb-0.5">
                    <Search className="w-3 h-3 text-ink-muted" />
                    <span>SERP Preview</span>
                  </div>
                  <p className="text-xs text-[#1a0dab] font-medium truncate hover:underline cursor-pointer">
                    {(seoTitle || title || "Untitled Dental Article") + " | GuruOm Dental Journal"}
                  </p>
                  <p className="text-[11px] text-[#006621] truncate font-mono">
                    https://guruomdental.com/blog/{slug || "article-slug"}
                  </p>
                  <p className="text-[11px] text-ink-muted line-clamp-2 leading-relaxed">
                    {seoDescription ||
                      excerpt ||
                      "Read professional clinical insights, modern dental techniques, and complete patient care guidance from GuruOm Dental."}
                  </p>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Apple Sheet: Link Dialog (Ctrl+K) */}
      {showLinkDialog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="link-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40 p-4 transition-all"
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowLinkDialog(false);
          }}
        >
          <div className="bg-white/95 backdrop-blur-2xl border border-black/[0.08] rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h2 id="link-dialog-title" className="font-display font-semibold text-base text-ink">
                Insert Link
              </h2>
              <button
                type="button"
                onClick={() => setShowLinkDialog(false)}
                className="w-8 h-8 rounded-full text-ink-muted hover:text-ink hover:bg-black/[0.05] inline-flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label htmlFor="link-url-input" className="block text-xs font-medium text-ink mb-1.5">
                Target URL
              </label>
              <input
                id="link-url-input"
                type="url"
                autoFocus
                placeholder="https://... or /services/implants"
                value={linkUrl}
                onChange={(e) => {
                  setLinkUrl(e.target.value);
                  setLinkError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyLink();
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/[0.1] bg-surface/50 text-ink focus:bg-white focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all outline-hidden"
              />
              {linkError && <p className="text-xs text-rose-600 font-medium mt-1.5">{linkError}</p>}
              <p className="text-[10px] text-ink-muted mt-1.5">
                Allowed: https://, mailto:, tel:, or /relative-paths
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLinkDialog(false)}
                className="px-3.5 py-1.5 rounded-xl border border-black/[0.08] bg-white hover:bg-surface text-xs font-medium text-ink transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyLink}
                className="px-4 py-1.5 rounded-xl bg-ink text-white text-xs font-medium hover:bg-brand-dark transition-all active:scale-95 shadow-xs"
              >
                Apply Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apple Sheet: Schedule Dialog */}
      {showScheduleDialog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="schedule-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40 p-4 transition-all"
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowScheduleDialog(false);
          }}
        >
          <div className="bg-white/95 backdrop-blur-2xl border border-black/[0.08] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h2 id="schedule-dialog-title" className="font-display font-semibold text-base text-ink">
                Schedule Publication
              </h2>
              <button
                type="button"
                onClick={() => setShowScheduleDialog(false)}
                className="w-8 h-8 rounded-full text-ink-muted hover:text-ink hover:bg-black/[0.05] inline-flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              Choose date and time in <span className="font-semibold text-ink">IST (UTC+05:30)</span>. Must be at least 5 minutes in the future and within 2 years.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="schedule-date-input" className="block text-xs font-medium text-ink mb-1">
                  Date
                </label>
                <input
                  id="schedule-date-input"
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => {
                    setScheduleDate(e.target.value);
                    setScheduleError("");
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-black/[0.1] bg-surface/50 text-ink focus:bg-white focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all outline-hidden cursor-pointer"
                />
              </div>

              <div>
                <label htmlFor="schedule-time-input" className="block text-xs font-medium text-ink mb-1">
                  Time (IST)
                </label>
                <input
                  id="schedule-time-input"
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => {
                    setScheduleTime(e.target.value);
                    setScheduleError("");
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-black/[0.1] bg-surface/50 text-ink focus:bg-white focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all outline-hidden cursor-pointer"
                />
              </div>
            </div>

            {scheduleDate && (
              <div className="p-3 bg-surface/80 rounded-xl border border-black/[0.04] text-xs space-y-1">
                <span className="text-[10px] text-ink-muted font-semibold uppercase tracking-wider block">
                  Scheduled Preview
                </span>
                <p className="text-xs text-ink font-medium">
                  {(() => {
                    try {
                      const utc = istInputToUtc(scheduleDate, scheduleTime);
                      return `Will go live on ${formatUtcToIst(utc)} (${formatRelativeTime(utc)})`;
                    } catch {
                      return "Invalid schedule input";
                    }
                  })()}
                </p>
              </div>
            )}

            {scheduleError && <p className="text-xs text-rose-600 font-medium">{scheduleError}</p>}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowScheduleDialog(false)}
                className="px-3.5 py-1.5 rounded-xl border border-black/[0.08] bg-white hover:bg-surface text-xs font-medium text-ink transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleScheduleSubmit}
                disabled={isPending || !scheduleDate}
                className="px-4 py-1.5 rounded-xl bg-ink text-white text-xs font-medium hover:bg-brand-dark transition-all active:scale-95 disabled:opacity-50 shadow-xs"
              >
                {isPending ? "Scheduling..." : "Confirm Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apple Alert: Version Conflict Modal */}
      {conflictModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40 p-4 transition-all"
        >
          <div className="bg-white/95 backdrop-blur-2xl border border-black/[0.08] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-amber-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h2 className="font-display font-semibold text-base text-ink">Version Conflict Detected</h2>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              This publication was updated by another session or tab while you were editing. To prevent accidental data loss, your changes were not committed over the newer version.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 rounded-xl bg-ink text-white text-xs font-medium hover:bg-brand-dark transition-all active:scale-95 shadow-xs"
              >
                Reload Latest Version (Discard My Changes)
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await duplicatePostAction(post.id);
                    showToastMsg("Saved your version as a new draft copy!");
                    router.push(`${baseOwnerPath || "/ow"}/posts/${res.id}/edit`);
                  } catch (e: unknown) {
                    showToastMsg(e instanceof Error ? e.message : "Failed to duplicate", "error");
                  }
                }}
                className="w-full px-4 py-2 rounded-xl border border-black/[0.08] bg-white hover:bg-surface text-xs font-medium text-ink transition-all active:scale-95"
              >
                Keep Mine as a New Draft Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apple macOS Style Slide-Over Drawer: Revision History */}
      {showRevisions && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex justify-end backdrop-blur-xs bg-black/30 transition-all"
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowRevisions(false);
          }}
        >
          <div className="bg-white/95 backdrop-blur-2xl w-full max-w-md h-full shadow-2xl flex flex-col border-l border-black/[0.08] animate-in slide-in-from-right duration-200">
            <div className="p-5 border-b border-black/[0.06] flex items-center justify-between">
              <div>
                <h2 className="font-display font-semibold text-base text-ink">Revision History</h2>
                <p className="text-xs text-ink-muted">Past 50 committed snapshots</p>
              </div>
              <button
                type="button"
                onClick={() => setShowRevisions(false)}
                className="w-8 h-8 rounded-full text-ink-muted hover:text-ink hover:bg-black/[0.05] inline-flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 divide-y divide-black/[0.05]">
              {initialRevisions.length === 0 ? (
                <p className="text-xs text-ink-muted text-center py-12">No revisions recorded yet.</p>
              ) : (
                initialRevisions.map((rev) => (
                  <div key={rev.id} className="py-3.5 space-y-1.5 first:pt-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-ink text-xs capitalize">
                        {rev.action || "Save"}
                      </span>
                      <span className="text-[11px] text-ink-muted font-mono">{rev.createdAtIst}</span>
                    </div>
                    <p className="text-xs text-ink-muted">
                      {rev.reason || "Manual commit"} • {rev.wordCount} words
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setPreviewRevision(rev)}
                        className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-black/[0.04] hover:bg-black/[0.08] text-ink transition-all"
                      >
                        Preview Snapshot
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const conf = window.confirm(
                            "Restore this snapshot into your working copy? Unsaved edits in the editor will be replaced."
                          );
                          if (conf) restoreRevisionSnapshot(rev);
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 transition-all"
                      >
                        Restore Version
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Snapshot Preview Modal */}
      {previewRevision && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40 p-4 transition-all"
          onKeyDown={(e) => {
            if (e.key === "Escape") setPreviewRevision(null);
          }}
        >
          <div className="bg-white/95 backdrop-blur-2xl border border-black/[0.08] rounded-3xl p-6 max-w-xl w-full max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <h3 className="font-display font-semibold text-sm text-ink">
                Revision Snapshot ({previewRevision.createdAtIst})
              </h3>
              <button
                type="button"
                onClick={() => setPreviewRevision(null)}
                className="w-8 h-8 rounded-full text-ink-muted hover:text-ink hover:bg-black/[0.05] inline-flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 space-y-3 text-xs">
              <div>
                <span className="font-semibold text-ink-muted uppercase text-[10px] tracking-wider">Title:</span>
                <p className="font-semibold text-sm text-ink">{String(previewRevision.snapshot?.title ?? "")}</p>
              </div>
              <div>
                <span className="font-semibold text-ink-muted uppercase text-[10px] tracking-wider">Excerpt:</span>
                <p className="text-ink-muted">{String(previewRevision.snapshot?.excerpt ?? "")}</p>
              </div>
              <div>
                <span className="font-semibold text-ink-muted uppercase text-[10px] tracking-wider">Content Blocks:</span>
                <pre className="bg-surface/80 p-3 rounded-xl border border-black/[0.05] font-mono text-[11px] max-h-60 overflow-y-auto">
                  {JSON.stringify(previewRevision.snapshot?.content, null, 2)}
                </pre>
              </div>
            </div>
            <div className="pt-3 border-t border-black/[0.06] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPreviewRevision(null)}
                className="px-3.5 py-1.5 rounded-xl border border-black/[0.08] bg-white hover:bg-surface text-xs font-medium text-ink transition-all active:scale-95"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => restoreRevisionSnapshot(previewRevision)}
                className="px-4 py-1.5 rounded-xl bg-ink text-white text-xs font-medium hover:bg-brand-dark transition-all active:scale-95 shadow-xs"
              >
                Restore This Version
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apple Shortcuts HUD Popover */}
      {showShortcuts && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed bottom-16 right-6 z-40 bg-white/95 backdrop-blur-2xl border border-black/[0.08] rounded-2xl p-4 shadow-2xl text-xs w-72 space-y-2 animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-black/[0.06]">
            <span className="font-semibold text-ink">Keyboard Shortcuts</span>
            <button
              type="button"
              onClick={() => setShowShortcuts(false)}
              className="w-6 h-6 rounded-full text-ink-muted hover:text-ink hover:bg-black/[0.05] inline-flex items-center justify-center transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2 text-ink-muted pt-1">
            <div className="flex justify-between items-center">
              <span>Save / Commit</span>
              <kbd className="px-2 py-0.5 rounded-md bg-black/[0.05] border border-black/[0.06] font-mono text-[10px] text-ink font-semibold">
                ⌘S / Ctrl+S
              </kbd>
            </div>
            <div className="flex justify-between items-center">
              <span>Insert Safe Link</span>
              <kbd className="px-2 py-0.5 rounded-md bg-black/[0.05] border border-black/[0.06] font-mono text-[10px] text-ink font-semibold">
                ⌘K / Ctrl+K
              </kbd>
            </div>
            <div className="flex justify-between items-center">
              <span>Bold Text</span>
              <kbd className="px-2 py-0.5 rounded-md bg-black/[0.05] border border-black/[0.06] font-mono text-[10px] text-ink font-semibold">
                ⌘B / Ctrl+B
              </kbd>
            </div>
            <div className="flex justify-between items-center">
              <span>Italic Text</span>
              <kbd className="px-2 py-0.5 rounded-md bg-black/[0.05] border border-black/[0.06] font-mono text-[10px] text-ink font-semibold">
                ⌘I / Ctrl+I
              </kbd>
            </div>
            <div className="flex justify-between items-center">
              <span>Paste Plain Text</span>
              <kbd className="px-2 py-0.5 rounded-md bg-black/[0.05] border border-black/[0.06] font-mono text-[10px] text-ink font-semibold">
                ⌘⇧V
              </kbd>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerTarget !== null}
        onClose={() => {
          setMediaPickerTarget(null);
          replaceLegacyNodeRef.current = null;
        }}
        onSelect={handleMediaPickerSelect}
        title={
          mediaPickerTarget === "cover"
            ? "Choose Article Cover Image"
            : mediaPickerTarget === "legacy"
            ? "Replace Legacy Slot Image"
            : "Insert Image into Article"
        }
      />

      {/* Video Picker Modal */}
      <VideoPickerModal
        isOpen={isVideoPickerOpen}
        onClose={() => setIsVideoPickerOpen(false)}
        onSelect={handleInsertVideo}
      />
    </div>
  );
}
