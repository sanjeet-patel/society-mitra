#!/usr/bin/env node
/**
 * Validates demo admin accounts can authenticate and have expected roles.
 * Run from repo root: node apps/web/scripts/validate-admin-login.mjs
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../../..");

function loadEnv() {
  for (const file of [resolve(root, "apps/web/.env.local"), resolve(root, ".env.local")]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m && !process.env[m[1].trim()]) {
        process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
      }
    }
    break;
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error("FAIL: Missing Supabase env vars in apps/web/.env.local");
  process.exit(1);
}

const accounts = [
  {
    label: "Platform Super Admin",
    mobile: "9999999999",
    password: "demo-admin",
    expectPlatformAdmin: true,
    expectSocietyAdminSlug: null,
  },
  {
    label: "Society Admin",
    mobile: "9876501234",
    password: "demo-tenant",
    expectPlatformAdmin: false,
    expectSocietyAdminSlug: "greenvalley",
  },
];

async function signIn(mobile, password) {
  const email = `${mobile}@societymitra.auth`;
  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error_description || body.msg || res.statusText);
  return body;
}

async function getProfile(userId, accessToken) {
  const res = await fetch(
    `${url}/rest/v1/profiles?user_id=eq.${userId}&select=id,is_platform_admin,phone,full_name`,
    {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Profile query failed (${res.status}): ${body}`);
  }
  const rows = await res.json();
  return rows[0];
}

async function getAdminMembership(profileId, slug, accessToken) {
  const res = await fetch(
    `${url}/rest/v1/society_members?profile_id=eq.${profileId}&status=eq.approved&select=role,societies(slug)&societies.slug=eq.${slug}`,
    {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Membership query failed (${res.status}): ${body}`);
  }
  const rows = await res.json();
  return rows[0];
}

let failed = false;

for (const account of accounts) {
  process.stdout.write(`Checking ${account.label}... `);
  try {
    const session = await signIn(account.mobile, account.password);
    const profile = await getProfile(session.user.id, session.access_token);
    if (!profile) throw new Error("Profile not found");

    if (Boolean(profile.is_platform_admin) !== account.expectPlatformAdmin) {
      throw new Error(
        `is_platform_admin=${profile.is_platform_admin}, expected ${account.expectPlatformAdmin}`
      );
    }

    if (account.expectSocietyAdminSlug) {
      const membership = await getAdminMembership(
        profile.id,
        account.expectSocietyAdminSlug,
        session.access_token
      );
      if (!membership) throw new Error(`No membership in ${account.expectSocietyAdminSlug}`);
      if (!["society_admin", "block_admin"].includes(membership.role)) {
        throw new Error(`role=${membership.role}, expected society_admin`);
      }
    }

    console.log("OK");
  } catch (err) {
    failed = true;
    console.log("FAIL");
    console.error(`  ${err.message}`);
  }
}

if (failed) {
  console.error("\nSome checks failed. Run: supabase db reset (local) or apply seed SQL on cloud.");
  process.exit(1);
}

console.log("\nAll admin login checks passed.");
