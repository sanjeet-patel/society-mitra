const AUTH_EMAIL_DOMAIN = "societymitra.auth";

/** Normalize user input to a 10-digit Indian mobile number. */
export function normalizeIndianMobile(input: string): string | null {
  const digits = input.replace(/\D/g, "");

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  if (digits.length === 10) {
    return digits;
  }

  return null;
}

export function isValidIndianMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile);
}

/** Supabase Auth login id derived from mobile (not shown to users). */
export function mobileToAuthEmail(mobile: string): string {
  return `${mobile}@${AUTH_EMAIL_DOMAIN}`;
}

export function authEmailToMobile(email: string | null | undefined): string | null {
  if (!email?.endsWith(`@${AUTH_EMAIL_DOMAIN}`)) return null;
  const mobile = email.slice(0, email.indexOf("@"));
  return isValidIndianMobile(mobile) ? mobile : null;
}
