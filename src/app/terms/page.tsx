import type { Metadata } from "next";
import { LegalShell } from "@/components/legal-shell";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Terms of Use · ${BRAND.name}`,
  description: `House rules for ${BRAND.name}, a gluten-free social companion.`,
};

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Use" updated="15 September 2026">
      <p>
        Welcome to {BRAND.name}. These terms are a friendly house-rules note, not a substitute for
        legal advice. By creating an account you agree to use the community in good faith.
      </p>

      <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">The service</h2>
      <p>
        {BRAND.name} is a gluten-free social network with Messenger, dining notes, recipes, and
        optional health-adjacent tools (journal, recovery card, label scan, GF cost tracker). It is
        provided as-is. Features can change. The public host may remain {BRAND.domain} (or a Vercel
        preview URL) while the product name is Lumen.
      </p>

      <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">Not medical or tax advice</h2>
      <p>
        Nothing here is a diagnosis, treatment plan, or professional tax opinion — even when a
        Canadian chartered accountant built the cost tracker. Label scans are heuristics, not lab
        tests. Dining confidence is community-reported. Always use your own clinician, dietitian, or
        tax professional when the stakes are real.
      </p>

      <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">Your account</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>You are responsible for your password. Use forgot-password if you lose it.</li>
        <li>One human per account. Do not impersonate others.</li>
        <li>You can export or delete your account from settings.</li>
      </ul>

      <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">Your content</h2>
      <p>
        You keep the rights to what you post. You give us permission to host and display it so the
        product works (feed, profile, Messenger, dining directory). Do not post anyone’s private
        medical details, illegal content, or junk that harasses people. Guestbook comments are plain
        text; owners may delete them. We may hide or remove content that breaks these rules.
      </p>

      <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">Be decent</h2>
      <p>
        Block, mute, and flag exist because gluten-free life is already hard enough. No scams, no
        scraping the community for spam, no attempting to break into someone else’s account. Dining
        listings you add start pending until a moderator publishes them. Claims about kitchens are
        capped until visits land.
      </p>

      <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">Availability</h2>
      <p>
        We try to keep {BRAND.name} up. We cannot promise zero downtime, perfect matching, or that a
        restaurant will still be safe the next time you go. Use your judgement at the table.
      </p>

      <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">Contact</h2>
      <p>
        <a className="font-semibold text-brand-600 hover:underline" href={`mailto:${BRAND.taxesEmail}`}>
          {BRAND.taxesEmail}
        </a>
        . If a rule here needs a formal legal document later, we will say so on this page.
      </p>
    </LegalShell>
  );
}
