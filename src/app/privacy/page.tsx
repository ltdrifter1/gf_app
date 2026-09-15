import type { Metadata } from "next";
import { LegalShell } from "@/components/legal-shell";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Privacy Policy · ${BRAND.name}`,
  description: `How ${BRAND.name} handles your account, health-adjacent notes, and community content.`,
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="15 September 2026">
      <p>
        This is a plain-language privacy notice for {BRAND.name}, a gluten-free social companion
        (currently hosted at {BRAND.domain}). It is not legal advice. If you need advice for your
        situation, talk to a lawyer who knows Canadian privacy law.
      </p>

      <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">Who we are</h2>
      <p>
        {BRAND.name} is a community product: profiles, Messenger, dining notes, recipes, a private
        journal, optional label scans, and a Canadian GF cost tracker. Health content is companionship
        and lived experience — not a clinic, and not medical advice.
      </p>

      <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">What we collect</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Account: name, email, username, password hash, optional city and avatar.</li>
        <li>Profile Studio: theme, wallpaper, Top 8, guestbook comments you leave or receive.</li>
        <li>Community: posts, comments, follows, DMs, dining reviews you choose to share.</li>
        <li>
          Optional private tools: journal, mood, glutening logs, label scans, GF receipts. These stay
          off your public page unless you post them yourself.
        </li>
        <li>Technical: session cookie, approximate IP for rate limits, optional push subscription.</li>
      </ul>

      <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">How we use it</h2>
      <p>
        To run the service you asked for: sign-in, Messenger, matching a buddy if you tap that button,
        showing your public profile, keeping dining listings trustworthy, and (if you opt in) private
        pattern insights. We do not sell your personal information. We do not use health logs for ads.
      </p>

      <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">Cookies</h2>
      <p>
        Sign-in uses an httpOnly session cookie named <code>lumen_session</code> (older sessions may
        still be <code>safely_session</code>). That cookie is how we know it is you. Theme preference
        lives in local storage on your device.
      </p>

      <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">
        Sharing and processors
      </h2>
      <p>
        Hosting, database, optional email (Resend), and optional photo storage (Vercel Blob) see the
        data needed to provide those features. Public profile bits — name, blurbs, Top 8, guestbook —
        are visible to other signed-in members. Do not put medical record numbers, insurance IDs, or
        anyone else’s private details on your page.
      </p>

      <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">Your choices</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Edit or empty profile fields any time in Profile Studio / Edit Profile.</li>
        <li>Download a ZIP of your data, or delete your account, from account settings.</li>
        <li>Block or mute people. Flag content that is not okay.</li>
        <li>Scan history older than 90 days is dropped unless you ask us to keep it.</li>
      </ul>

      <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">Children</h2>
      <p>
        {BRAND.name} is meant for adults. Caregiver tools exist for parents supporting kids, but we
        do not knowingly collect personal information from children under 13.
      </p>

      <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">Contact</h2>
      <p>
        Questions: <a className="font-semibold text-brand-600 hover:underline" href={`mailto:${BRAND.taxesEmail}`}>{BRAND.taxesEmail}</a>.
        Hosted in connection with Canada; we aim to handle requests in a reasonable time.
      </p>
    </LegalShell>
  );
}
