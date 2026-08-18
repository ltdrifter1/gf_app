/**
 * Launch health library — mental + physical guides for gluten-free / celiac life.
 * Warm peer voice; educational only. Crisis language kept on mental pieces.
 */

export type LaunchHealthResource = {
  slug: string;
  title: string;
  pillar: "mental" | "physical";
  category: string;
  type: "article" | "exercise" | "tip";
  toolKey: string | null;
  content: string;
  body: string;
};

export const LAUNCH_HEALTH: LaunchHealthResource[] = [
  // ─── Mental: anxiety ─────────────────────────────────────────
  {
    slug: "anxiety-toolkit",
    title: "A Pocket Toolkit for Food Anxiety",
    pillar: "mental",
    category: "anxiety",
    type: "exercise",
    toolKey: "anxiety-toolkit",
    content:
      "Box breathing, a worry window, and a safe-foods list that proves dinner can still be calm.",
    body: `All-day vigilance is a full-time job nobody applied for. Small tools beat toughing it out.

Box breathing: inhale 4 · hold 4 · exhale 4 · hold 4. Four rounds. Phone timer optional, dramatic sighing encouraged.

Worry window: give food fears a 10-minute appointment, then park them until then. (Yes, your brain will try to renegotiate. That’s fine.)

Safe-foods anchor: list 5 meals you trust at home. When anxiety spikes, look at the list — proof that safety isn’t imaginary.

Name the spiral out loud: “This is hypervigilance doing its job too loudly.” Labeling lowers the volume for a lot of people.

Pair it with a mood check-in on Track so patterns live somewhere besides your 2 a.m. thoughts. If anxiety is constant, panic attacks are frequent, or food fear is shrinking your life to a handful of “safe” calories, loop in a clinician who understands chronic illness — peer tools are companions, not treatment.`,
  },
  {
    slug: "hypervigilance-explained",
    title: "Hypervigilance Isn’t “Being Dramatic”",
    pillar: "mental",
    category: "anxiety",
    type: "article",
    toolKey: null,
    content:
      "Why your brain scans every menu like a threat report — and how to keep the useful parts without living on red alert.",
    body: `After a glutening (or years of unexplained illness), your nervous system learns: food can hurt. Scanning labels, kitchens, and shared fryers is adaptive. The problem is when the scanner never clocks out.

What hypervigilance often looks like:
- Re-reading the same ingredient list until the letters blur
- Replaying a meal for hours (“Did the waiter hear me?”)
- Avoiding plans that used to feel easy
- Irritability that isn’t really about the dishes

What helps many of us:
- Keep the useful habits (ask clearly, choose known-safer spots) and retire the endless re-litigation
- One “enough” rule: if you’ve asked once and gotten a clear answer, stop the mental replay loop with a redirect (walk, text a friend, Journal)
- Body cues: tight jaw, shallow breath, racing thoughts — that’s your cue to run the anxiety toolkit, not to keep investigating

You’re not dramatic. You’re trained. Retraining is slower than diagnosis day — and still worth it.`,
  },
  {
    slug: "panic-before-meals",
    title: "When Panic Shows Up Right Before You Eat",
    pillar: "mental",
    category: "anxiety",
    type: "tip",
    toolKey: null,
    content:
      "A short grounding script for the moment your heart races as the plate arrives.",
    body: `The plate lands. Your chest tightens. Suddenly you’re not hungry — you’re negotiating with catastrophe.

Try this micro-script (30–90 seconds):
1. Feet on floor. Name 3 things you can see that aren’t the food.
2. One slow breath out longer than the inhale.
3. One fact: “I asked. I chose carefully. My body is reacting to memory, not a verdict.”
4. One choice: take a bite, ask again, or leave. All three are allowed.

If panic is frequent, talk with a clinician about anxiety support tailored to chronic illness. You’re allowed to want meals that don’t feel like exams.`,
  },

  // ─── Mental: depression ──────────────────────────────────────
  {
    slug: "low-mood-chronic",
    title: "Low Mood & Living With a Chronic Thing",
    pillar: "mental",
    category: "depression",
    type: "article",
    toolKey: null,
    content:
      "Peer support helps — and sometimes you need a clinician who understands chronic illness. Here’s how to tell the difference.",
    body: `Repeated glutening, slow healing, and “can we just order pizza” culture can flatten a mood. You’re not imagining it.

Watch for: sleep that won’t cooperate, losing interest in things you usually like, hopelessness about food forever, pulling away from people who help, feeling like a burden at every table.

Gentle supports that often help alongside professional care:
- Tiny non-food wins logged in Journal (a walk, a shower, one kind text)
- Messenger rooms when isolation is loud
- Track notes so “I’m fine” doesn’t erase a hard month at the next appointment

This space is peer support, not therapy. If low mood sticks around most days for two weeks or more — or you have thoughts of harming yourself — reach out to a clinician or a local crisis line.

In the US, call or text 988. Needing more than an app doesn’t make you weak. It makes you someone who deserves care.`,
  },
  {
    slug: "anhedonia-food-joy",
    title: "When Food Stops Feeling Like Joy",
    pillar: "mental",
    category: "depression",
    type: "article",
    toolKey: null,
    content:
      "Pleasure can go quiet after diagnosis or a long flare. How to rebuild tiny sparks without forcing “gratitude.”",
    body: `Some of us don’t lose appetite — we lose delight. Meals become logistics. Favorite restaurants become threat assessments. That’s grief and depression’s cousin, not a character flaw.

Ways people gently rebuild:
- One sensory win that isn’t a “cheat”: a beautiful plate, a scent, a texture you still love
- Shared non-food rituals with friends (walks, movies, tea with sealed snacks)
- Cooking one low-stakes recipe from Safely Recipes when energy allows — curiosity over perfection

If nothing feels good for weeks, that’s clinical information, not laziness. Bring it to a professional. Joy isn’t a luxury metric; it’s a health signal.`,
  },
  {
    slug: "ask-for-help-script",
    title: "How to Ask for Help Without a Speech",
    pillar: "mental",
    category: "depression",
    type: "tip",
    toolKey: "ask-for-help",
    content:
      "Short scripts for friends, partners, and clinicians when you don’t have energy for a TED talk.",
    body: `Low mood steals eloquence. You don’t need a perfect explanation.

Try:
- Friend: “I’m having a rough gluten-free week. Can you sit with me / walk / text later?”
- Partner: “I need quieter plans and known-safe food tonight — not advice, just backup.”
- Clinician: “Mood has been low most days for ___ weeks. Appetite / sleep / hope are off. Can we talk options?”

Use the interactive checklist to pick who you’ll message today. One ask counts.`,
  },

  // ─── Mental: isolation ───────────────────────────────────────
  {
    slug: "social-isolation",
    title: "Staying Social When Every Invite Needs Logistics",
    pillar: "mental",
    category: "isolation",
    type: "article",
    toolKey: null,
    content:
      "Scripts that lower the temperature at shared meals — plus easy ways to find your people here.",
    body: `Isolation loves to dress up as “I’m just busy.” Sometimes you’re busy. Sometimes you’re tired of being the allergen detective at every table.

Scripts that help:
- “I’d love to come — can we pick somewhere with a dedicated GF option, or I’ll eat first and join for dessert/tea?”
- “I’m bringing a dish I trust so I can actually hang out instead of hovering by the kitchen.”
- “Rain check on dinner, but I’m free for a walk / coffee with something sealed.”

On Safely: open a room, follow folks who get it, and post when you need a reality check. Wanting company isn’t neediness — it’s how humans work.

If you’ve declined everything for months, start with one low-stakes yes. Belonging rebuilds in small reps.`,
  },
  {
    slug: "found-family-gf",
    title: "Building a Gluten-Free Found Family",
    pillar: "mental",
    category: "isolation",
    type: "article",
    toolKey: null,
    content:
      "Friends who pack snacks, read labels with you, and never say “just a little.” How to grow that circle on purpose.",
    body: `Blood family doesn’t always get it. Found family does the grocery run with you, texts restaurant screenshots, and celebrates a boring safe meal like a win.

How people grow that circle:
- Follow and DM kindness on Community posts that resonate
- Show up in Messenger rooms with one honest sentence
- Invite someone to a known-safer coffee — not a high-stakes tasting menu
- Be that person for someone newer than you

You don’t need a huge network. Two or three people who understand cross-contact can change a lonely year.`,
  },

  // ─── Mental: eating-out ──────────────────────────────────────
  {
    slug: "eating-out-spiral",
    title: "When Restaurant Anxiety Spins Out",
    pillar: "mental",
    category: "eating-out",
    type: "exercise",
    toolKey: "eating-out-spiral",
    content:
      "A friendly 4-step reset for the pre-menu freakout — breathe, pick one plan, ask clearly, be kind to yourself.",
    body: `If your brain starts writing disaster novels before you even sit down — hi, you’re among friends.

Try this short loop:

1. Breathe — four in, four out, three rounds. Boring on purpose.
2. Plan — one known-safer spot or one dish you can actually verify.
3. Ask — short and clear: “I have celiac. Can this be made without gluten cross-contact?”
4. Soften — one careful meal is enough. Leaving is allowed. You’re not high-maintenance; you’re informed.

Still buzzing? Step outside, text someone who gets it, or pop into the Mental Health room. We’re not grading your dinner performance.`,
  },
  {
    slug: "server-scripts",
    title: "Server Scripts That Don’t Sound Like an Apology",
    pillar: "mental",
    category: "eating-out",
    type: "tip",
    toolKey: "server-scripts",
    content:
      "Clear, calm lines for celiac and gluten-free needs — practice once, use forever.",
    body: `You don’t owe the table a medical lecture. Clarity > apology.

Try:
- “I have celiac disease. I need no gluten and no shared fryer / prep surfaces if possible. What do you recommend?”
- “Can you check with the kitchen whether the sauce / marinade / seasoning has wheat?”
- “If there’s any doubt, I’ll order something else or skip — no hard feelings.”

If the answer is vague (“should be fine”), it’s okay to choose a different dish or leave. Your gut is not a customer-service scorecard.`,
  },
  {
    slug: "group-dinner-plan",
    title: "Surviving Group Dinners Without Melting Down",
    pillar: "mental",
    category: "eating-out",
    type: "article",
    toolKey: null,
    content:
      "Advance picks, ally seats, exit plans — logistics that protect both your body and your night out.",
    body: `Group dinners amplify everything: menus, opinions, “just try it” energy.

Before:
- Suggest 2–3 places you’ve researched (or Safely Dining favorites)
- Eat a small safe snack so you’re not starving into bad decisions
- Tell one ally your plan (“I may step out / order carefully”)

During:
- Sit near the person who backs you up
- Order first if that reduces pressure
- Decline shared plates kindly: “I’m good with mine — cross-contact is rough for me.”

After: log how it went in Journal or Track. Patterns teach you which formats actually work for your nervous system.`,
  },

  // ─── Mental: newly-diagnosed ─────────────────────────────────
  {
    slug: "diagnosis-grief",
    title: "Yeah, Diagnosis Can Feel Like Grief",
    pillar: "mental",
    category: "newly-diagnosed",
    type: "article",
    toolKey: null,
    content:
      "Missing spontaneity and shared plates isn’t dramatic — it’s human. Here’s how people move through it without rushing the feelings.",
    body: `Nobody hands you a pamphlet titled “Also you might mourn bagels.” But a lot of us do.

You might miss grab-and-go nights, family recipes, or the ease of saying yes to every invite. Anger at “just one bite” advice is valid. Relief and exhaustion can share a calendar invite.

What helps many of us:
- Name what you miss without roasting yourself for missing it
- Keep one small ritual that still works — tea, a walk, that bakery that gets it
- Talk to people living this (feed posts, Messenger rooms) instead of white-knuckling alone
- Remember healing is measured in months, not “I should be fine by Monday.”

Grief doesn’t mean you’re bad at gluten-free. It means the change is real — and you’re allowed to take care of the soft parts too.`,
  },
  {
    slug: "first-30-days",
    title: "The First 30 Days: A Gentle Survival Map",
    pillar: "mental",
    category: "newly-diagnosed",
    type: "exercise",
    toolKey: "first-30-days",
    content:
      "Week-by-week priorities so you don’t try to master the entire gluten-free universe before Thursday.",
    body: `Week 1: Safety basics — pantry sweep, a few trusted meals, tell close people.
Week 2: Labels + one kitchen habit (dedicated toaster / butter, or clear house rules).
Week 3: One dining or social experiment with an exit plan.
Week 4: Book or prep questions for follow-up care; open Journal or Track.

You will not become an expert in a month. You will become slightly less lost. That’s the win.

Use the interactive checklist and check items off at your pace — not Instagram’s.`,
  },
  {
    slug: "explain-to-others",
    title: "Explaining Celiac Without Exhausting Yourself",
    pillar: "mental",
    category: "newly-diagnosed",
    type: "tip",
    toolKey: null,
    content:
      "Short, medium, and “please stop” versions for coworkers, relatives, and curious strangers.",
    body: `Short: “I have celiac — gluten damages my intestine. I need strictly gluten-free food, including no cross-contact.”

Medium: add one example (“shared fryers count”) and one ask (“can we pick X restaurant?”).

Stop: “I’ve got it covered — thanks!” then change the subject. You are not a walking FAQ.

Save energy for people who will actually help. Curiosity isn’t always care.`,
  },

  // ─── Mental: grief ───────────────────────────────────────────
  {
    slug: "identity-after-diagnosis",
    title: "Who Am I If Spontaneity Left the Chat?",
    pillar: "mental",
    category: "grief",
    type: "article",
    toolKey: null,
    content:
      "Identity shifts after going gluten-free — foodie, traveler, easygoing friend. How to rebuild without pretending nothing changed.",
    body: `Diagnosis rewrites roles. Maybe you were the adventurous eater, the host with the most, the “yes” to every trip. Now logistics show up first. That can feel like losing a personality trait.

You’re not less you. You’re you with a new constraint — and constraints often reveal values: care, honesty, creativity, community.

Rebuild identity on purpose:
- Keep one food joy that still works (a cuisine, a chef at home, a bakery)
- Add non-food identity anchors (hobbies, humor, advocacy, mentoring newer folks)
- Journal the sentence: “I’m still someone who…” and finish it without gluten in the blank

Grief for the old ease can coexist with pride in the new skill. Both are true.`,
  },
  {
    slug: "body-image-gf",
    title: "Body Image When Your Gut Rebels",
    pillar: "mental",
    category: "grief",
    type: "article",
    toolKey: null,
    content:
      "Bloating, weight shifts, and “before” photos — soft talk about appearance while healing.",
    body: `Healing isn’t linear on the scale or in the mirror. Bloating, weight changes, skin flares, and exhaustion can tangle with how you see yourself.

Gentle rules many of us use:
- No body-roasting after a glutening week
- Clothes that fit today’s body without a lecture
- Focus on function (energy, sleep, pain) over aesthetics for a season

If food rules are sliding into restriction beyond medical need, or body hatred is constant, that’s a signal to involve a clinician experienced in disordered eating and chronic illness. Strict GF is medical — punishment is not.`,
  },

  // ─── Mental: relationships ───────────────────────────────────
  {
    slug: "dating-gf",
    title: "Dating When Gluten Is on the First-Date Agenda",
    pillar: "mental",
    category: "relationships",
    type: "article",
    toolKey: null,
    content:
      "When to tell, how to tell, and how to spot partners who treat your needs like logistics — not drama.",
    body: `You don’t owe a medical essay before appetizers. You do deserve someone who won’t sulk when you ask about the shared fryer.

Timing that works for many:
- Before a meal-centered date: one clear sentence + preferred plan
- After chemistry shows: deeper context (celiac vs preference, cross-contact)

Green flags: they research with you, don’t pressure “just a bite,” remember your safe spots.
Red flags: teasing, secrecy about ingredients, making your caution the punchline.

Your needs are information, not a vibe kill. The right people adjust the plan — not your boundaries.`,
  },
  {
    slug: "partner-support",
    title: "Partners: How to Help Without Taking Over",
    pillar: "mental",
    category: "relationships",
    type: "tip",
    toolKey: null,
    content:
      "For the person who loves someone gluten-free — practical support that doesn’t feel like a second diagnosis.",
    body: `Helpful:
- Learn cross-contact basics
- Offer to call the restaurant
- Keep dedicated spreads / utensils if you share a kitchen
- Ask “what would make tonight easier?” instead of guessing

Less helpful:
- Policing every bite
- Sharing unverified cures
- Centering your inconvenience over their safety

If you’re the GF partner: say what help looks like this week. Needs change. Clarity is kindness.`,
  },
  {
    slug: "friendship-friction",
    title: "When Friends Don’t Get It (Yet)",
    pillar: "mental",
    category: "relationships",
    type: "article",
    toolKey: null,
    content:
      "Education scripts, boundary lines, and when it’s okay to shrink the guest list.",
    body: `Some friends learn fast. Some need repetition. Some never will.

Try once with clarity. Try twice with a concrete ask. After that, protect your energy: fewer shared meals, more sealed-snack hangs, or quieter distance.

You’re allowed to outgrow tables that treat your illness as optional. Belonging that costs your health isn’t belonging.`,
  },

  // ─── Mental: burnout ─────────────────────────────────────────
  {
    slug: "gf-burnout",
    title: "Gluten-Free Burnout Is Real",
    pillar: "mental",
    category: "burnout",
    type: "article",
    toolKey: null,
    content:
      "Label fatigue, advocacy fatigue, “I can’t explain this one more time.” How to rest without quitting safety.",
    body: `Burnout isn’t failing gluten-free. It’s what happens when every meal is a project and every social plan is a negotiation.

Signs: resentment at food, snapping at people who ask questions, skipping meals because deciding feels impossible, fantasy of “one normal bite.”

Recovery habits:
- Rotate default meals so decisions shrink
- Batch advocacy (one email to school / office, not five debates)
- Schedule “no new restaurants” weeks
- Use Journal for venting so friends aren’t your only outlet

Rest is part of the protocol. Safety and softness can share a calendar.`,
  },
  {
    slug: "perfectionism-trap",
    title: "The Perfectionism Trap After One Mistake",
    pillar: "mental",
    category: "burnout",
    type: "exercise",
    toolKey: "perfectionism-reset",
    content:
      "A short reset when an accidental exposure turns into a character trial.",
    body: `One mistake does not erase months of care. Perfectionism pretends otherwise.

Reset:
1. Fact: exposure happened / might have happened.
2. Care: hydrate, rest, known-safe foods, Track log.
3. Kindness: “Careful people still get glutened.”
4. Lesson: one system tweak (new question, new brand, new toaster rule) — not a personality overhaul.

Use the interactive walkthrough when shame is louder than the symptom list.`,
  },

  // ─── Mental: family ──────────────────────────────────────────
  {
    slug: "family-table-politics",
    title: "Family Tables, Holidays, and the Politics of Dishes",
    pillar: "mental",
    category: "family",
    type: "article",
    toolKey: null,
    content:
      "Scripts for relatives who love you and still think cross-contact is a personality quirk.",
    body: `Holidays concentrate gluten and opinions. You can love people and still decline Auntie’s casserole.

Scripts:
- “I’m bringing a main I trust so I can relax and enjoy being here.”
- “Please don’t mind if I skip shared utensils — it’s medical, not personal.”
- “If the kitchen can’t keep things separate, I’ll eat beforehand and join for company.”

Decide your non-negotiables before you walk in. You’re allowed to leave early. Tradition that harms you can be updated.`,
  },
  {
    slug: "parenting-gf-kids",
    title: "Parenting a Gluten-Free Kid Without Losing Yourself",
    pillar: "mental",
    category: "family",
    type: "article",
    toolKey: null,
    content:
      "School forms, playdates, and caregiver burnout — support for the grown-ups holding the clipboard.",
    body: `You’re advocating at school, sports, birthdays, and every sleepover. That’s a second job.

Protect the caregiver:
- Templates for teacher emails (reuse them)
- One trusted parent ally for parties
- Safely Parents room when you need “is this normal?”
- Your own Journal / Track — kids’ charts aren’t the only ones that matter

Ask for help explicitly. Martyrdom doesn’t keep anyone safer.`,
  },
  {
    slug: "household-mixed-diet",
    title: "Mixed Households: GF and Not-GF Under One Roof",
    pillar: "mental",
    category: "family",
    type: "tip",
    toolKey: "mixed-kitchen-talk",
    content:
      "Agreements that reduce resentment — dedicated zones, butter rules, and shared meals that don’t become battles.",
    body: `Love doesn’t automatically teach crumb discipline. Agreements do.

Talk through:
- Shared vs dedicated tools
- Who cleans what
- How guests are briefed
- What “close enough” will never mean

Revisit quarterly. Households evolve. Resentment grows in silence; checklists grow in conversations.`,
  },

  // ─── Physical: gut ───────────────────────────────────────────
  {
    slug: "gut-healing-basics",
    title: "Gut Healing Without the Miracle-Cure Energy",
    pillar: "physical",
    category: "gut",
    type: "article",
    toolKey: null,
    content:
      "Strict GF is the treatment; the lining still takes time. Nutrient-dense meals, rest, and your care team’s timeline win.",
    body: `Strict gluten-free eating is the treatment. Healing the lining is… slower than Instagram implies. Often months. Annoying, but true.

Practical basics:
- Stay strictly GF — cross-contact counts, even when it’s inconvenient
- Lean on protein, iron-friendly foods, and simple meals while symptoms settle
- Hydrate. Rest more than productivity culture would allow
- Follow your GI’s plan for labs / follow-up timing

Common companions while healing: bloating, irregular bowel habits, temporary lactose sensitivity for some people. Discuss persistent pain, blood, fever, or unintentional weight loss with a clinician promptly.

Track flares on Track so you’re not reconstructing history from vibes at the appointment.`,
  },
  {
    slug: "bloating-gas-map",
    title: "Bloating, Gas, and “Is This Still Healing?”",
    pillar: "physical",
    category: "gut",
    type: "article",
    toolKey: null,
    content:
      "How to think about ongoing symptoms without spiraling — and what to bring to your next visit.",
    body: `Not every gassy day means you were glutened. Healing guts can be noisy. So can stress, new fibers, dairy, and menstrual cycles.

Useful notes for your clinician:
- Timing relative to meals / travel / cycle
- Stool changes, pain location, nocturnal symptoms
- What you ate (brands matter)
- Severity trend from Track

Avoid stacking ten elimination diets at once unless guided. More restriction isn’t always more healing — sometimes it’s more malnutrition and anxiety.

Educational only: your team interprets your pattern.`,
  },
  {
    slug: "constipation-diarrhea-gf",
    title: "When the Bathroom Schedule Won’t Settle",
    pillar: "physical",
    category: "gut",
    type: "tip",
    toolKey: null,
    content:
      "Gentle, non-miracle approaches while you wait on healing — and red flags that need a call.",
    body: `Some people swing between constipation and urgency during early GF months. Hydration, soluble fiber (if tolerated), movement, and routine help many — but this is not DIY medical care.

Call promptly for dehydration, blood, severe pain, black stools, or symptoms that wake you at night.

Bring a two-week Track log. Patterns beat “it’s been weird.”`,
  },

  // ─── Physical: nutrition ─────────────────────────────────────
  {
    slug: "nutrient-gaps",
    title: "Nutrient Gaps (Without the Supplement Spiral)",
    pillar: "physical",
    category: "nutrition",
    type: "tip",
    toolKey: null,
    content:
      "Iron, B12, D, calcium, and folate show up a lot. Ask about labs — skip the megadose internet shopping spree.",
    body: `Malabsorption + a suddenly smaller menu can leave gaps. Common ones: iron, B12, vitamin D, calcium, folate, sometimes zinc.

Please don’t megadose because a thread said so — some supplements fight each other or just… don’t absorb. Some aren’t gluten-free.

Ask your clinician which labs make sense, and whether a celiac-aware dietitian can peek at a real week of eating. Food-first when you can; targeted supplements when labs say so.`,
  },
  {
    slug: "protein-fiber-gf",
    title: "Protein, Fiber, and Fullness on a GF Plate",
    pillar: "physical",
    category: "nutrition",
    type: "article",
    toolKey: null,
    content:
      "Rice-and-regret meals are common early on. How to rebuild satisfying plates without a nutrition degree.",
    body: `Early gluten-free eating often slides into carbs-for-comfort. Fine for a minute — rough as a lifestyle.

Aim for a boringly effective plate: protein + colorful plants + a fat you tolerate + a GF carb you trust.

Ideas: eggs, beans (if tolerated), fish, tofu, yogurt if dairy’s okay, nuts/seeds, quinoa, potatoes, certified oats if your team says yes.

If appetite is tiny after a flare, liquid calories and soft foods count. Healing seasons aren’t meal-prep contests.`,
  },
  {
    slug: "dietitian-visit-prep",
    title: "How to Prep for a Celiac-Aware Dietitian Visit",
    pillar: "physical",
    category: "nutrition",
    type: "exercise",
    toolKey: "dietitian-prep",
    content:
      "A checklist so the appointment covers your real week — not an idealized grocery list.",
    body: `Bring:
- 3–7 days of what you actually ate
- Brands that confuse you
- Symptoms + Track notes
- Supplement bottles
- Goals (energy, sports, kids’ lunches, budget)

Ask about: fortified foods, calcium/vitamin D strategy, eating out, and whether further testing is needed.

Use the interactive checklist before you go.`,
  },

  // ─── Physical: recovery ──────────────────────────────────────
  {
    slug: "after-glutening",
    title: "After Accidental Glutening",
    pillar: "physical",
    category: "recovery",
    type: "tip",
    toolKey: "glutening-checklist",
    content:
      "Rest, hydrate, known-safe foods, track symptoms. Most flares ease in a few days — call your doctor if it’s severe.",
    body: `Accidents happen to careful people. Recovery > self-roast.

Immediate: stop exposure, hydrate, rest, stick to simple foods you trust.
Next 48–72h: log severity on Track, sleep extra, skip hero workouts if you’re wiped.
Call your doctor for severe pain, persistent vomiting, dehydration, blood in stool, or symptoms that won’t ease.

Shame doesn’t heal anything. Rest and notes do. You’re still part of the club.`,
  },
  {
    slug: "glutening-timeline",
    title: "What the Next Few Days Often Feel Like",
    pillar: "physical",
    category: "recovery",
    type: "article",
    toolKey: null,
    content:
      "A peer map of common trajectories — not a promise. Your body writes its own draft.",
    body: `Many people notice digestive symptoms within hours to a day; brain fog, fatigue, and mood dips can linger longer. Some flares are short. Some take a week-plus to feel baseline again.

Supportive patterns:
- Simple safe foods
- Extra sleep
- Gentle movement only if it helps
- Hydration / electrolytes if you’re losing fluids (ask your clinician what’s appropriate)

Avoid stacking new supplements mid-flare unless advised. You’re gathering data for your team, not running a chemistry fair.`,
  },
  {
    slug: "prevent-repeat-exposure",
    title: "Turning One Accident Into Fewer Next Times",
    pillar: "physical",
    category: "recovery",
    type: "tip",
    toolKey: null,
    content:
      "A blame-free postmortem: brand, kitchen, travel, or mixed household — fix the system, not your worth.",
    body: `After you can think clearly, ask:
- Where did gluten enter? (restaurant, shared butter, oats, sauce, communion wafer, medication…)
- What question wasn’t asked?
- What tool / brand / habit would block a repeat?

Write one system change in Journal. One. Perfectionism wants twenty; safety improves with one durable fix.`,
  },

  // ─── Physical: energy ────────────────────────────────────────
  {
    slug: "fighting-fatigue",
    title: "When Fatigue Won’t Clock Out",
    pillar: "physical",
    category: "energy",
    type: "article",
    toolKey: null,
    content:
      "Healing is tiring. Sleep, protein, gentle daylight — and permission to not “push through.”",
    body: `Fatigue after diagnosis or a glutening is extremely common while iron stores and your intestine catch up.

Levers that often help: consistent sleep, protein at meals, short daylight walks, and treating “push through” as optional.

If fatigue is crushing or comes with dizziness, ask about anemia and vitamin D. Bring your Track log — patterns help clinicians take you seriously (and save you from a fuzzy memory monologue).`,
  },
  {
    slug: "brain-fog-gf",
    title: "Brain Fog on a Gluten-Free Journey",
    pillar: "physical",
    category: "energy",
    type: "article",
    toolKey: null,
    content:
      "Word-finding issues and cotton-head days — peer context plus what to mention at follow-up.",
    body: `Fog can follow exposures, poor sleep, iron deficiency, or just the cognitive load of constant vigilance.

Helpful supports: hydration, meals with protein, breaks from screen-heavy work, Track notes on timing.

Persistent cognitive changes deserve medical evaluation — don’t write everything off as “just celiac.” Your clinician rules out other causes.`,
  },
  {
    slug: "exercise-while-healing",
    title: "Movement While You’re Still Healing",
    pillar: "physical",
    category: "energy",
    type: "tip",
    toolKey: null,
    content:
      "How to stay gently active without treating workouts like a loyalty test.",
    body: `If you’re depleted, walking and mobility work beat hero sessions. Return to intensity gradually as energy and iron improve — ideally with your clinician’s blessing if you’ve been very ill.

Stop for chest pain, severe dizziness, or fainting. Rest is productive when the goal is healing, not a PR.`,
  },

  // ─── Physical: labs ──────────────────────────────────────────
  {
    slug: "labs-checklist",
    title: "Labs Worth Asking About",
    pillar: "physical",
    category: "labs",
    type: "tip",
    toolKey: "labs-checklist",
    content:
      "tTG-IgA (and total IgA), CBC, ferritin, vitamin D, B12 — a conversation starter for your next visit, not a prescription.",
    body: `Every care plan is individual — this is a friendly checklist, not medical orders.

Often discussed: tTG-IgA (+ total IgA), CBC, ferritin, vitamin D, B12, folate; bone density when risk factors apply. Some clinicians also discuss thyroid screening given autoimmune overlap patterns — ask what’s relevant for you.

Use the interactive checklist, then bring what you checked to your appointment. Educational only — your clinician decides what’s right for you.`,
  },
  {
    slug: "follow-up-cadence",
    title: "Follow-up Timing Without the Guesswork Panic",
    pillar: "physical",
    category: "labs",
    type: "article",
    toolKey: null,
    content:
      "Why “see you in a year” varies — and how to prepare questions so you leave with a plan.",
    body: `Follow-up depends on diagnosis details, antibody trends, symptoms, and your clinician’s protocol. There isn’t one universal calendar.

Bring:
- Symptom / Track summary
- Diet questions
- Growth / cycle / bone concerns if relevant
- Mental health notes if food fear is shrinking your life

Ask: “What are we monitoring next, and when should I message sooner?” Clarity reduces 2 a.m. spirals.`,
  },
  {
    slug: "antibody-results-decode",
    title: "Reading Antibody Results Without Spiraling",
    pillar: "physical",
    category: "labs",
    type: "tip",
    toolKey: null,
    content:
      "Numbers are data for your care team — not a moral score. How to talk about trends calmly.",
    body: `Antibody trends can take time to move. A single number rarely tells the whole story — diet adherence, IgA status, lab variability, and healing all matter.

Don’t change your diet based on internet interpretations of a PDF. Ask your clinician what the trend means for you and whether biopsy / imaging / dietitian support is next.

You’re allowed to feel feelings about results and still wait for professional interpretation.`,
  },

  // ─── Physical: kitchen ───────────────────────────────────────
  {
    slug: "kitchen-cross-contact",
    title: "Home Kitchen Cross-Contact: The Practical Tour",
    pillar: "physical",
    category: "kitchen",
    type: "exercise",
    toolKey: "kitchen-audit",
    content:
      "Toaster, butter, cutting boards, air fryers — a room-by-room audit that actually fits real life.",
    body: `Shared kitchens are where careful people get surprised.

High-yield fixes:
- Dedicated toaster or toaster bags
- No double-dipping butter / PB / jam
- Separate cutting boards & colanders
- Wipe shared counters before GF prep
- Watch flour in the air if someone bakes gluten

Use the interactive audit and check what you’ve handled. Perfect is rare; safer is incremental.`,
  },
  {
    slug: "pantry-reset",
    title: "Pantry Reset After Diagnosis",
    pillar: "physical",
    category: "kitchen",
    type: "article",
    toolKey: null,
    content:
      "What to toss, what to replace, and how to label shelves so future-you doesn’t play guessing games.",
    body: `Start with open condiments and shared jars — crumbs travel. Replace spices that lived over a gluten-baking zone if contamination is likely.

Label a GF shelf at eye level. Put certified GF oats (if allowed for you) away from regular oats forever.

Invite housemates into the tour once. Systems beat nagging.`,
  },
  {
    slug: "eating-away-from-home-kit",
    title: "A Tiny Kit for Eating Away From Home",
    pillar: "physical",
    category: "kitchen",
    type: "tip",
    toolKey: null,
    content:
      "Cards, snacks, and backup meals that turn travel days and long meetings into fewer emergencies.",
    body: `Many people keep: sealed snacks, a restaurant card in their language, backup meal (rice cup / safe bar), antihistamine only if prescribed/advised for other reasons — ask your clinician what’s appropriate for you.

The kit isn’t paranoia. It’s infrastructure.`,
  },

  // ─── Physical: skin-bones ────────────────────────────────────
  {
    slug: "dermatitis-herpetiformis",
    title: "Itchy Bumps and Dermatitis Herpetiformis Talk",
    pillar: "physical",
    category: "skin-bones",
    type: "article",
    toolKey: null,
    content:
      "Peer context on the skin side of celiac — see a dermatologist for diagnosis; don’t self-treat from photos.",
    body: `Some people with celiac get a blistering, intensely itchy rash (dermatitis herpetiformis). Diagnosis belongs to a clinician — often dermatology with appropriate testing.

Strict GF is the long-game treatment for DH related to celiac; medications may be used under medical supervision. Internet steroid experiments are a bad plot twist.

If you have an unexplained chronic itchy rash, ask your care team — especially if you also have gut or nutrient issues.`,
  },
  {
    slug: "bone-health-celiac",
    title: "Bones, Density, and Why It Comes Up",
    pillar: "physical",
    category: "skin-bones",
    type: "article",
    toolKey: null,
    content:
      "Malabsorption can affect bone health. What to ask about — without inventing a scan schedule yourself.",
    body: `Celiac can interfere with calcium and vitamin D absorption. Some people need bone density evaluation; others don’t. Risk factors and age matter.

Ask your clinician whether DEXA or labs are appropriate for you. Food sources, supplements, and weight-bearing movement may be part of a plan — individualized.

Educational only: don’t start high-dose anything from a forum.`,
  },

  // ─── Physical: dental ────────────────────────────────────────
  {
    slug: "dental-celiac",
    title: "Teeth, Enamel, and Mouth Sores",
    pillar: "physical",
    category: "dental",
    type: "article",
    toolKey: null,
    content:
      "Dental clues sometimes show up with celiac. Tell your dentist — and keep up with care while healing.",
    body: `Enamel defects, recurrent aphthous ulcers, and dry mouth complaints show up in some celiac stories. They’re not diagnostic on their own.

Tell your dentist about your diagnosis so they have context. Keep routine cleanings when you can — healing bodies still need mouths cared for.

Any severe oral pain, unexplained lesions, or bleeding deserves professional evaluation promptly.`,
  },
  {
    slug: "dentist-visit-script",
    title: "What to Tell Your Dentist in One Minute",
    pillar: "physical",
    category: "dental",
    type: "tip",
    toolKey: null,
    content:
      "A short script so the visit includes gluten-free polish pastes and relevant history.",
    body: `Try: “I have celiac disease. Please use gluten-free prophy paste if available, and note any enamel or ulcer history in my chart.”

Ask about products used in-office. Bring questions about sensitivity or dry mouth if relevant.

Tiny advocacy, big difference.`,
  },

  // ─── Physical: travel-body ───────────────────────────────────
  {
    slug: "travel-body-prep",
    title: "Travel Prep for Your Body (Not Just Your Suitcase)",
    pillar: "physical",
    category: "travel-body",
    type: "exercise",
    toolKey: "travel-body-prep",
    content:
      "Sleep, snacks, meds list, and flare plans so a trip doesn’t become a week-long recovery.",
    body: `Before you go:
- Pack more safe calories than you think you need
- Screenshot restaurant plans
- List medications / supplements with generics
- Decide your “if glutened abroad” plan (rest day, pharmacy, when to seek care)

During: hydrate on flights, don’t skip protein, protect sleep when you can.

Use the checklist so prep isn’t a 11 p.m. scramble.`,
  },
  {
    slug: "airport-and-road",
    title: "Airports, Road Trips, and Emergency Calories",
    pillar: "physical",
    category: "travel-body",
    type: "tip",
    toolKey: null,
    content:
      "Where careful travelers actually find food — and how to avoid the hangry glutening spiral.",
    body: `Airports vary wildly. Sealed snacks in your bag beat hoping Terminal B suddenly understands cross-contact.

Road trips: cooler with safe staples, apps/lists for dedicated GF stops, and a rule that hunger isn’t a reason to gamble.

If plans collapse, eat what you packed and rest. Stubbornness is not a nutrient.`,
  },

  // ─── Physical: meds ──────────────────────────────────────────
  {
    slug: "meds-excipients",
    title: "Medications, Vitamins, and Hidden Gluten",
    pillar: "physical",
    category: "meds",
    type: "article",
    toolKey: null,
    content:
      "Excipients can include wheat starch. How to ask pharmacists without becoming a full-time researcher.",
    body: `Most meds are fine for many people; some aren’t. Binders and coatings occasionally include gluten-containing ingredients.

Ask your pharmacist to verify specific products — especially when switching generics. For supplements, look for certified GF when possible and confirm with the manufacturer if unclear.

Never stop a prescribed medication because of a forum scare. Call the prescribing clinician or pharmacist with the exact product name.`,
  },
  {
    slug: "pharmacy-questions",
    title: "Questions to Ask the Pharmacist",
    pillar: "physical",
    category: "meds",
    type: "tip",
    toolKey: "pharmacy-questions",
    content:
      "A short list you can screenshot before refills and new prescriptions.",
    body: `Ask:
- Does this specific manufacturer/lot use gluten-containing excipients?
- Is there a preferred GF alternative if needed?
- Any food timing issues with my other meds?

Use the checklist at the counter. You’re allowed to be thorough — it’s your body.`,
  },
];
