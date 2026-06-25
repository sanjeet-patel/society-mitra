export const APP_DOMAIN = "societymitra.info";
export const PUBLIC_SITE_URL = `https://${APP_DOMAIN}`;

/** Runtime URL for auth redirects (use local URL in dev). */
export const AUTH_CALLBACK_BASE =
  process.env.NEXT_PUBLIC_APP_URL?.includes("localhost") ||
  process.env.NEXT_PUBLIC_APP_URL?.includes("127.0.0.1")
    ? process.env.NEXT_PUBLIC_APP_URL
    : PUBLIC_SITE_URL;

/** Runtime URL for auth redirects and metadata (env-aware). */
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? PUBLIC_SITE_URL;

export const DEMO_ACCOUNTS = [
  {
    role: "Super Admin",
    mobile: "9999999999",
    password: "demo-admin",
    description: "Platform administrator — create societies and manage tenants",
    loginPath: "/login?redirect=/admin",
    afterLoginPath: "/admin",
    afterLoginLabel: "Platform Dashboard",
  },
  {
    role: "Society Admin",
    mobile: "9876501234",
    password: "demo-tenant",
    description: "Society admin for Green Valley Apartments (Unit A-101)",
    loginPath: "/login?redirect=/greenvalley/admin",
    afterLoginPath: "/greenvalley/admin",
    afterLoginLabel: "Society Admin Console",
  },
] as const;
