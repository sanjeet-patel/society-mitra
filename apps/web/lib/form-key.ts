/** Remount edit forms after router.refresh() so defaultValue props stay in sync. */
export function editFormKey(id: string, ...parts: (string | number | boolean | null | undefined)[]) {
  return `${id}|${parts.map((part) => String(part ?? "")).join("|")}`;
}
