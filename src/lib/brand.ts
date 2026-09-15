/** Product identity. Domain stays safelyceliac.com until DNS/rebrand of the host. */
export const BRAND = {
  name: "Lumen",
  tagline: "Your gluten-free companion. Find your people — and a little more light.",
  shortTagline: "Find your people.",
  landingLine: "Find your people — and a little more light.",
  domain: "safelyceliac.com",
  ogAlt: "Lumen — gluten-free companion",
  sessionCookie: "lumen_session",
  legacySessionCookie: "safely_session",
  /** Personal-tax enquiry — founder is a Canadian chartered accountant. */
  taxesEmail: "hello@safelyceliac.com",
} as const;

export function taxesMailto() {
  const subject = encodeURIComponent("Personal taxes — Lumen GF tracker");
  const body = encodeURIComponent(
    "Hi — I use Lumen’s gluten-free cost tracker and would like to ask about personal tax help.\n\n"
  );
  return `mailto:${BRAND.taxesEmail}?subject=${subject}&body=${body}`;
}
