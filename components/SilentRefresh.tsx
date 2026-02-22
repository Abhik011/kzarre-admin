"use client";

import { useEffect } from "react";
import { startSilentRefreshInterval, stopSilentRefreshInterval } from "@/lib/auth";

/**
 * Starts silent access-token refresh every 10 min when the user has a session.
 * Cleans up the interval on unmount (e.g. logout clears it via auth store).
 */
export default function SilentRefresh() {
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("refresh_token")) {
      startSilentRefreshInterval();
    }
    return () => stopSilentRefreshInterval();
  }, []);

  return null;
}
