"use client";

import { useCallback } from "react";
import { ShortFormProjectViewer } from "./ShortFormProjectViewer";

export function ShortFormRouteViewer() {
  const returnToWork = useCallback(() => window.location.assign("/work"), []);
  return <ShortFormProjectViewer open onClose={returnToWork} />;
}
