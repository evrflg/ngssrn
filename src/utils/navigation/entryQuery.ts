import { Platform } from "react-native";

/**
 * Captures the browser query string on first module load, before Expo Router
 * rewrites `/` → `/home` and drops search params.
 */
let capturedSearch = "";

function parseQuerySuffixFromWindow(): string {
  if (Platform.OS !== "web" || typeof window === "undefined") return "";

  const location = window.location;
  if (!location) return "";

  const search = location.search || "";
  if (search) return search;

  const hash = location.hash || "";
  if (hash.includes("?")) {
    return `?${hash.split("?").slice(1).join("?")}`;
  }

  return "";
}

if (Platform.OS === "web" && typeof window !== "undefined") {
  capturedSearch = parseQuerySuffixFromWindow();
}

export function getCapturedEntryQuerySuffix(): string {
  return capturedSearch;
}

export function getCapturedEntryQueryParams(): Record<string, string> {
  if (!capturedSearch) return {};

  const query = capturedSearch.startsWith("?")
    ? capturedSearch.slice(1)
    : capturedSearch;
  const params: Record<string, string> = {};
  new URLSearchParams(query).forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

/** Root entry paths that should forward query params to `/home`. */
export function isWebRootEntryPath(pathname: string): boolean {
  const withoutBase = pathname.replace(/\/rn-h5\/?$/i, "").replace(/\/$/, "");
  return withoutBase === "" || withoutBase === "/";
}

export function buildHomeHrefWithEntryQuery(): string {
  const suffix = getCapturedEntryQuerySuffix();
  return suffix ? `/home${suffix}` : "/home";
}
