import type { Metadata } from "next";

export const instant = false;

export const metadata: Metadata = {
  title: "Owner Portal",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-lenis-prevent
      data-owner-portal
      className="fixed inset-0 z-50 bg-surface flex flex-col font-body overflow-y-auto overscroll-contain"
    >
      <meta name="robots" content="noindex,nofollow,noarchive" />
      {children}
    </div>
  );
}
