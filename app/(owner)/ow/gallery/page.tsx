import { requireOwner } from "@/src/server/auth/guard";
import { loadGallery } from "@/src/server/gallery";
import { OwnerHeader } from "../owner-header";
import { GalleryEditor } from "./gallery-editor";

export const metadata = { title: "Homepage Gallery | Owner Management" };

export default async function GalleryPage() {
  const { user } = await requireOwner();
  const gallery = await loadGallery();
  return (
    <div className="min-h-screen bg-surface-alt text-ink">
      <OwnerHeader ownerEmail={user.email} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <GalleryEditor initial={gallery} />
      </main>
    </div>
  );
}
