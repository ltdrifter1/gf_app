/** Warm, practical caregiver copy — not medical or legal advice. */

export type CaregiverTemplate = {
  slug: string;
  title: string;
  blurb: string;
  body: string;
};

export const CAREGIVER_SCRIPTS = [
  {
    slug: "30-second",
    title: "30-second celiac explain",
    body: "Celiac isn't a preference — gluten (wheat, barley, rye) makes them actually sick, even in tiny crumbs. Cross-contact counts: shared toasters, fryers, and knives matter. If you're unsure, it's kinder to say so than to guess.",
  },
  {
    slug: "school-desk",
    title: "To a teacher, in one breath",
    body: "They have celiac disease. Please don't give food unless it's from our labelled stash. Crumbs on a shared table can be enough. We'll pack extras — thank you for helping them feel ordinary.",
  },
  {
    slug: "birthday-party",
    title: "Birthday / event host",
    body: "We're so glad to come. They can't have wheat, barley, or rye — including traces. We'll bring a safe cupcake and a labelled lunchbox so they can celebrate without making it your job to run a kitchen audit.",
  },
] as const;

export const CAREGIVER_LETTERS: CaregiverTemplate[] = [
  {
    slug: "school-letter",
    title: "School / daycare explanation letter",
    blurb: "Paste into email, tweak names, send. Not a 504/IEP legal form.",
    body: `Hello,

I'm writing about [Child's name], who has celiac disease. This is an autoimmune condition — not a food preference. Even small amounts of gluten (wheat, barley, rye, and most oats that aren't certified gluten-free) can make them unwell, sometimes hours later.

What helps:
• Please do not offer food, treats, or "just a nibble" unless it comes from the labelled safe stash we provide.
• Shared surfaces, toasters, and art supplies with wheat paste can be a problem. A quick wipe before snack time is a kindness.
• If a lesson involves food, a heads-up lets us send a matching safe option so they aren't sitting out.

We'll keep extra labelled snacks at school. Thank you for helping them feel included without turning every hour into a health lecture.

Warmly,
[Your name]
[Phone / email]`,
  },
  {
    slug: "event-letter",
    title: "Sports / camp / field-trip note",
    blurb: "Short note for coaches and volunteers.",
    body: `Hi,

[Child's name] has celiac disease and cannot have gluten (wheat, barley, rye) or foods prepared on shared equipment with those grains.

We'll send a labelled kit for snacks and meals. Please don't swap food with other kids. If plans change (pizza party, concession stand), a text lets us pivot.

This isn't about being fussy — traces can make them sick. Thank you for keeping the day fun and ordinary.

[Your name] · [Phone]`,
  },
  {
    slug: "family-letter",
    title: "Family gathering note",
    blurb: "For relatives who love you and still think a little bread is fine.",
    body: `Hi family,

Quick gluten reminder for [Name]. Celiac means gluten isn't a vibe — it's an immune reaction. Please don't sneak "just a bit," and if you cook for us, dedicated pans / foil / a fresh sponge help more than a speech.

We'll bring a dish we know is safe and are happy to talk through a menu. The goal is everyone at the table, not a science fair.

Love,
[You]`,
  },
];
