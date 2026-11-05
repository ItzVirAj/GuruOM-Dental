import { requireOwner } from "@/src/server/auth/guard";
import { OwnerHeader } from "../owner-header";
import { MediaView } from "./media-view";
import { listMediaAction } from "@/src/server/owner/media/actions";

export const metadata = {
  title: "Media Library | Owner Management | GuruOm Dental",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OwnerMediaPage() {
  const { user } = await requireOwner();
  const initialMedia = await listMediaAction({ limit: 40 });

  return (
    <div className="min-h-screen bg-surface-alt flex flex-col font-body text-ink">
      <OwnerHeader ownerEmail={user.email} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <MediaView initialData={initialMedia} />
      </main>
    </div>
  );
}

