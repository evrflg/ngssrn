export function formatGameCardNameForWideScreen(
  name: string | undefined,
  screenWidth: number,
): string {
  if (screenWidth <= 410 || name == null || typeof name !== "string") {
    return String(name ?? "");
  }

  const firstSpace = name.indexOf(" ");
  if (firstSpace === -1) return name;

  const nonSpaceBefore = name.slice(0, firstSpace).replace(/\s/g, "").length;
  if (nonSpaceBefore < 7) return name;

  return `${name.slice(0, firstSpace)}\n${name.slice(firstSpace + 1)}`;
}
