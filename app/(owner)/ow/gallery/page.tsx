import { requireOwner } from "@/src/server/auth/guard";
import { loadGallery } from "@/src/server/gallery";
import { OwnerHeader } from "../owner-header";
import { loadHomeImages } from "@/src/server/home-images";
import { FixedImageSections } from "./fixed-image-sections";
import { GalleryEditor } from "./gallery-editor";

export const metadata = { title: "Homepage Gallery | Owner Management" };

export default async function GalleryPage() {
  const { user } = await requireOwner();
  const [gallery, images] = await Promise.all([loadGallery(), loadHomeImages()]);
  return (
    <div className="min-h-screen bg-surface-alt text-ink">
      <OwnerHeader ownerEmail={user.email} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Homepage images</h1>
        <div className="space-y-3">
          <FixedImageSections images={images} />
          <details className="rounded-2xl border border-line bg-white">
            <summary className="cursor-pointer px-5 py-4 font-semibold">Gallery strip</summary>
            <div className="border-t border-line p-4"><GalleryEditor initial={gallery} /></div>
          </details>
        </div>
      </main>
    </div>
  );
}
