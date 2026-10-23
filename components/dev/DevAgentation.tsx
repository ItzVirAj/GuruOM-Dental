"use client";

import dynamic from "next/dynamic";

const AgentationToolbar = dynamic(
  () => import("agentation").then((mod) => mod.Agentation),
  { ssr: false }
);

/**
 * DevAgentation mounts the Agentation visual feedback toolbar only in development.
 * In production builds, this component returns null and avoids loading any dev assets.
 */
export function DevAgentation() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return <AgentationToolbar />;
}

export default DevAgentation;
