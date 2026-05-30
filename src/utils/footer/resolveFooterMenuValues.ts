const APP_DOWNLOAD_MENU_CODE = "APP_DOWNLOAD";
const DEFAULT_APP_DOWNLOAD_REPLACE_CODE = "LOGIN";

export function resolveFooterMenuValues(
  values: string,
  replace: string | undefined,
  applyAppDownloadReplace: boolean,
): string {
  if (!values || !applyAppDownloadReplace) return values;

  const replacementCode =
    replace
      ?.split(",")
      .map((code) => code.trim())
      .find((code) => Boolean(code)) ?? DEFAULT_APP_DOWNLOAD_REPLACE_CODE;

  return values
    .split(",")
    .map((code) => code.trim())
    .map((code) => (code === APP_DOWNLOAD_MENU_CODE ? replacementCode : code))
    .filter((code) => Boolean(code))
    .join(",");
}
