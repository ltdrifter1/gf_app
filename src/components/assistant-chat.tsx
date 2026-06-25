"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, BookOpen, Stethoscope } from "lucide-react";

type Msg = { id: string; role: string; content: string; sources?: { title: string; note: string }[]; medical?: boolean };

const SUGGESTIONS = [
  "Is soy sauce safe for celiac?",
  "How do I avoid cross contamination at home?",
  "What can I cook tonight?",
  "Can you explain tTG-IgA lab results?",
];

export function AssistantChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/assistant")
      .then((r) => r.json())
      .then((d) => setMessages(d.messages || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function ask(question: string) {
    if (!question.trim() || loading) return;
    setInput("");
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: "user", content: question }]);
    setLoading(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { id: data.id, role: "assistant", content: data.content, sources: data.sources, medical: data.medical },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pb-4">
        {messages.length === 0 && (
          <div className="card mx-auto mt-6 max-w-xl p-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-violet-400 to-brand-500 text-white">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold text-sage-900 dark:text-white">Celiac Assistant</h2>
            <p className="mt-2 text-sage-500 dark:text-sage-400">
              Ask about ingredients, dining, recipes, or how you're feeling. Answers
              are educational and cite sources — never a replacement for your doctor.
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => ask(s)} className="btn-secondary text-left text-sm">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] ${m.role === "user" ? "" : "w-full max-w-2xl"}`}>
              {m.role === "assistant" && (
                <div className="mb-1 flex items-center gap-1.5 px-1 text-xs font-medium text-violet-600 dark:text-violet-300">
                  <Sparkles className="h-3.5 w-3.5" /> Celiac Assistant
                  {m.medical && (
                    <span className="chip bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                      <Stethoscope className="h-3 w-3" /> Consult a professional
                    </span>
                  )}
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-3 text-sm shadow-soft ${
                  m.role === "user"
                    ? "rounded-br-md bg-brand-600 text-white"
                    : "card !rounded-2xl text-sage-800 dark:text-sage-100"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 space-y-1 border-t border-white/40 dark:border-white/10 pt-2">
                    <p className="flex items-center gap-1 text-xs font-semibold text-sage-500"><BookOpen className="h-3 w-3" /> Sources</p>
                    {m.sources.map((s, i) => (
                      <p key={i} className="text-xs text-sage-500 dark:text-sage-400">
                        <span className="font-medium text-sage-700 dark:text-sage-200">{s.title}</span> — {s.note}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="card !rounded-2xl px-4 py-3">
              <span className="flex gap-1">
                <span className="h-2 w-2 animate-pulse-soft rounded-full bg-violet-400" />
                <span className="h-2 w-2 animate-pulse-soft rounded-full bg-violet-400 [animation-delay:0.2s]" />
                <span className="h-2 w-2 animate-pulse-soft rounded-full bg-violet-400 [animation-delay:0.4s]" />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="glass-strong flex items-center gap-2 rounded-3xl p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask(input)}
          placeholder="Ask the Celiac Assistant…"
          className="input flex-1"
        />
        <button onClick={() => ask(input)} disabled={loading || !input.trim()} className="btn-primary px-4">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
