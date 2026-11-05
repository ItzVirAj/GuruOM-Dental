import { notFound } from "next/navigation";
import { requireOwner } from "@/src/server/auth/guard";
import { getOwnerVideoForEditing } from "@/src/server/owner/videos/queries";
import { ownerHref } from "@/src/lib/owner-url";
import { EditVideoClient } from "./edit-video-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Video | Owner Portal",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

interface EditVideoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OwnerEditVideoPage({ params }: EditVideoPageProps) {
  await requireOwner();
  const { id } = await params;
  const data = await getOwnerVideoForEditing(id);

  if (!data) {
    notFound();
  }

  return (
    <EditVideoClient
      initialData={data}
      baseOwnerPath={ownerHref("")}
    />
  );
}
