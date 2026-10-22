import type { Metadata } from "next";
import { fontDisplay, fontBody } from "@/lib/fonts";
import SmoothScroll from "@/components/animations/SmoothScroll";
import { Navbar, Footer } from "@/components/layout";
import "./globals.css";

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
      className={`${fontDisplay.variable} ${fontBody.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js');`,
          }}
        />
      </head>
      <body className="font-body bg-surface text-ink antialiased selection:bg-accent selection:text-ink min-h-screen flex flex-col">
        <SmoothScroll>
          <Navbar />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
