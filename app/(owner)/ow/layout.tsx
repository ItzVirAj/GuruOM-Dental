import type { Metadata } from "next";

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
    <div className="fixed inset-0 z-50 bg-surface flex flex-col min-h-screen font-body overflow-y-auto">
      <meta name="robots" content="noindex,nofollow,noarchive" />
      {children}
    </div>
  );
}
