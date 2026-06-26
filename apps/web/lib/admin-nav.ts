export const ADMIN_NAV_ICONS = [
  "dashboard",
  "building",
  "users",
  "folder",
  "wrench",
  "tag",
  "phone",
  "megaphone",
] as const;

export type AdminNavIconName = (typeof ADMIN_NAV_ICONS)[number];

/** Serializable nav item — safe to pass from Server Components to AdminShell. */
export type AdminNavItem = {
  href: string;
  label: string;
  icon: AdminNavIconName;
  badge?: number;
  exact?: boolean;
};
