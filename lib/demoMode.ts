"use client";
import { useEffect, useState } from "react";

export function useLocalDemoMode() {
  const [enabled, setEnabled] = useState(process.env.NODE_ENV === "development");
  useEffect(() => {
    const sync = () => setEnabled(
      process.env.NODE_ENV === "development" &&
        new URLSearchParams(window.location.search).get("demo") !== "0",
    );
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  return enabled;
}

