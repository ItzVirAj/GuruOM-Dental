"use client";

import { createContext, useContext } from "react";
import type { HomeImages } from "@/data/home-images";

const HomeImageContext = createContext<HomeImages>({});

export function useHomeImage(slot?: string) {
  const images = useContext(HomeImageContext);
  return slot ? images[slot] : undefined;
}

export function HomeImageProvider({ images, children }: { images: HomeImages; children: React.ReactNode }) {
  return <HomeImageContext.Provider value={images}>{children}</HomeImageContext.Provider>;
}
