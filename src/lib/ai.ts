// AI Celiac Assistant.
// Uses OpenAI when OPENAI_API_KEY is set; otherwise falls back to a built-in
// rule-based assistant so the feature is fully functional with no API key.

export type AiSource = { title: string; note: string };
export type AiAnswer = { content: string; sources: AiSource[]; medical: boolean };

const DISCLAIMER =
  "\n\n*This is educational information, not medical advice. For diagnosis, lab interpretation, or treatment, please consult your doctor or a registered dietitian.*";

const KB: { match: RegExp; answer: string; sources: AiSource[]; medical?: boolean }[] = [
  {
    match: /cross.?contam|shared|fryer|toaster/i,
    answer:
      "To avoid cross-contamination: use a **dedicated toaster** (or toaster bags), separate butter/condiment jars, color-coded cutting boards, and a **dedicated fryer** when eating out. Even crumbs can contain enough gluten to trigger a reaction in celiac disease.",
    sources: [
      { title: "Celiac Disease Foundation — Cross-Contact", note: "Practical kitchen separation guidance" },
      { title: "Knowledge Center: Long-term Management", note: "In-app article by Dr. Amara Chen" },
    ],
  },
  {
    match: /safe to eat|is this safe|can i eat|ingredient/i,
    answer:
      "Generally **gluten-free** grains include rice, corn, quinoa, buckwheat, and certified GF oats. Watch out for hidden gluten in **soy sauce, malt, seitan, some oats, and processed sauces**. Always look for a certified gluten-free label, and when in doubt, check our Product Database safety rating.",
    sources: [
      { title: "Product Database", note: "Crowdsourced safety ratings in-app" },
      { title: "FDA Gluten-Free Labeling Rule", note: "<20 ppm standard for 'gluten-free'" },
    ],
  },
  {
    match: /restaurant|eat out|dining|order/i,
    answer:
      "When dining out: call ahead, ask about a **dedicated prep area and fryer**, mention you have celiac (not a preference), and check our Safe Dining map for community confidence scores. Places with a 'Celiac Safe' badge and dedicated kitchens are your safest bet.",
    sources: [{ title: "Safe Dining Directory", note: "Community confidence & cross-contamination scores" }],
  },
  {
    match: /cook|dinner|recipe|tonight|meal/i,
    answer:
      "For a quick safe dinner tonight, try a **rice or quinoa bowl** with roasted veggies and a protein, or our community favorite 15-minute veggie pad thai (rice noodles + tamari). Browse the Recipes tab and filter by **Quick Meals** for more.",
    sources: [{ title: "Recipes — Quick Meals", note: "Community-rated GF recipes in-app" }],
  },
  {
    match: /lab|blood test|ttg|biopsy|result|deficien/i,
    answer:
      "Common celiac labs include **tTG-IgA** antibodies and total IgA, sometimes followed by an endoscopy with biopsy for confirmation. Newly diagnosed patients are often checked for **iron, B12, vitamin D, folate, and calcium** deficiencies. I can explain what these markers mean in general terms, but your doctor should interpret your specific results.",
    sources: [{ title: "Knowledge Center: Nutritional Deficiencies", note: "By Nina Alvarez, RD" }],
    medical: true,
  },
  {
    match: /anxiety|depress|alone|isolat|overwhelm|scared|stress/i,
    answer:
      "What you're feeling is valid — diagnosis can bring real grief and anxiety. Try our **Mental Health Center** for guided journaling and mood tracking, and consider joining the Mental Health chat room. You're not alone in this. 💙",
    sources: [{ title: "Mental Health Center", note: "Mood tracking, journaling & resources in-app" }],
    medical: true,
  },
];

function ruleBased(question: string): AiAnswer {
  const hit = KB.find((k) => k.match.test(question));
  if (hit) {
    return { content: hit.answer + DISCLAIMER, sources: hit.sources, medical: !!hit.medical };
  }
  return {
    content:
      "Great question! Here's how I'd approach it: prioritize **certified gluten-free** products, watch for **cross-contamination**, and lean on the community for real-world experience. Ask me about specific ingredients, restaurants, recipes, or how you're feeling." +
      DISCLAIMER,
    sources: [{ title: "Circle", note: "Community knowledge & expert articles" }],
    medical: false,
  };
}

export async function getAssistantAnswer(
  question: string,
  history: { role: string; content: string }[] = []
): Promise<AiAnswer> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return ruleBased(question);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are the Celiac Assistant for Circle, a community-first app for gluten-free living. Give warm, accurate, source-aware education about celiac disease and gluten-free living. Always distinguish education from medical advice and encourage professional consultation for diagnosis/lab/treatment questions.",
          },
          ...history.slice(-6).map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
          { role: "user", content: question },
        ],
        temperature: 0.5,
        max_tokens: 400,
      }),
    });
    if (!res.ok) return ruleBased(question);
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return ruleBased(question);
    return {
      content: content + DISCLAIMER,
      sources: [{ title: "OpenAI gpt-4o-mini", note: "Generated with celiac-aware system prompt" }],
      medical: /lab|result|diagnos|treatment|medic/i.test(question),
    };
  } catch {
    return ruleBased(question);
  }
}
