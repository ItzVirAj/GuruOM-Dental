import { requireOwner } from "@/src/server/auth/guard";
import { getOwnerVideosList } from "@/src/server/owner/videos/queries";
import { ownerHref } from "@/src/lib/owner-url";
import { VideosListView } from "./videos-list-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Videos Library | Owner Portal",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function OwnerVideosPage() {
  await requireOwner();
  const videos = await getOwnerVideosList();

  return (
    <VideosListView
      initialVideos={videos}
      baseOwnerPath={ownerHref("")}
    />
  );
}
