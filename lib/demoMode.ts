"use client";
import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

function getSnapshot() {
  return process.env.NODE_ENV === "development" && new URLSearchParams(window.location.search).get("demo") === "1";
}

function getServerSnapshot() {
  return false;
}

export function useLocalDemoMode() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
