export function createPageUrl(pageName: string | undefined | null): string {
  if (!pageName || typeof pageName !== "string") return "/";
  return "/" + pageName.replace(/ /g, "-");
}
