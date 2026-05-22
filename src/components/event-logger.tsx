"use client";

import { useEffect } from "react";
import { logEvent } from "@/lib/actions/achievements";

export function EventLogger({ event }: { event: string }) {
  useEffect(() => {
    logEvent(event);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
