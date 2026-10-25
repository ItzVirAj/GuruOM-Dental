import type { Metadata, Viewport } from "next";
import { fontDisplay, fontBody, fontAileron, fontLeagueSpartan, fontArabicaMenu, fontRainbowMiracles } from "@/lib/fonts";
import SmoothScroll from "@/components/animations/SmoothScroll";
import { Navbar, Footer } from "@/components/layout";
import { DevAgentation } from "@/components/dev/DevAgentation";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#1E1B1C",
};

export const metadata: Metadata = {
  title: {
    default: "GuruOm Dental | Precision Smile Aesthetics & Implantology",
    template: "%s | GuruOm Dental",
  },
  description:
    "Calm, premium, and trustworthy dental care. Advanced implantology, aesthetic smile design, and painless root canal treatments at GuruOm Dental.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`js ${fontDisplay.variable} ${fontBody.variable} ${fontAileron.variable} ${fontLeagueSpartan.variable} ${fontArabicaMenu.variable} ${fontRainbowMiracles.variable}`}
      suppressHydrationWarning
    >
      <body className="font-body bg-surface text-ink antialiased selection:bg-accent selection:text-on-accent min-h-screen flex flex-col">
        <SmoothScroll>
          <Navbar />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
          <DevAgentation />
        </SmoothScroll>
      </body>
    </html>
  );
}
