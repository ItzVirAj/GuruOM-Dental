import { Instrument_Serif, DM_Sans } from "next/font/google";
import localFont from "next/font/local";

export const fontDisplay = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const fontBody = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

export const fontAileron = localFont({
  src: [
    {
      path: "../public/fonts/Aileron-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Aileron-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-aileron",
  display: "swap",
});

export const fontLeagueSpartan = localFont({
  src: "../public/fonts/LeagueSpartan-Bold.otf",
  weight: "700",
  style: "normal",
  variable: "--font-league-spartan",
  display: "swap",
});

export const fontArabicaMenu = localFont({
  src: "../public/fonts/arabica-menu.regular.ttf",
  weight: "400",
  style: "normal",
  variable: "--font-arabica-menu",
  display: "swap",
});

export const fontRainbowMiracles = localFont({
  src: "../public/fonts/RainbowAndMiracles.otf",
  weight: "400",
  style: "normal",
  variable: "--font-rainbow-miracles",
  display: "swap",
});


