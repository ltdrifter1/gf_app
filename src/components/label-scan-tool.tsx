"use client";

import { useState, useTransition } from "react";
import { Camera, ClipboardPaste, Loader2, ScanLine, Trash2 } from "lucide-react";
import { deleteLabelScan, scanIngredients } from "@/lib/actions/scan";
import { verdictLabel, type ScanVerdict } from "@/lib/gluten-scan";
import { cn, timeAgo } from "@/lib/utils";

type HistoryItem = {
  id: string;
  source: string;
  verdict: string;
  reasons: string[];
  preview: string;
  createdAt: string;
};

async function ocrFile(file: File): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  try {
    const { data } = await worker.recognize(file);
    return (data.text || "").trim();
  } finally {
    await worker.terminate();
  }
}

export function LabelScanTool({ initialHistory }: { initialHistory: HistoryItem[] }) {
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const [ocrBusy, setOcrBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    verdict: ScanVerdict;
    reasons: string[];
    hits: { token: string; severity: string; reason: string }[];
  } | null>(null);
  const [history, setHistory] = useState(initialHistory);

  function runScan(source: "image" | "paste", value: string) {
    setError(null);
    start(async () => {
      const res = await scanIngredients({ text: value, source, persist: true });
      if ("error" in res && res.error) {
        setError(res.error);
        return;
      }
      if ("ok" in res && res.ok) {
        setResult({ verdict: res.verdict, reasons: res.reasons, hits: res.hits });
        if (res.id) {
          setHistory((prev) => [
            {
              id: res.id!,
              source,
              verdict: res.verdict,
              reasons: res.reasons,
              preview: value.slice(0, 140),
              createdAt: new Date().toISOString(),
            },
            ...prev,
          ]);
        }
      }
    });
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setOcrBusy(true);
    setError(null);
    try {
      const extracted = await ocrFile(file);
      if (!extracted) {
        setError("Couldn't read that photo. Try a sharper shot, or paste the ingredients.");
        return;
      }
      setText(extracted);
      runScan("image", extracted);
    } catch {
      setError("On-device OCR didn't load. Paste the ingredient list instead — the checker still works.");
    } finally {
      setOcrBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-3 p-5">
        <div className="flex items-start gap-3">
          <ScanLine className="mt-0.5 h-5 w-5 text-brand-600" />
          <div>
            <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">
              Label / menu scan
            </h2>
            <p className="text-sm text-sage-500">
              Upload a photo or paste ingredients. We highlight wheat, barley, rye, malt, and common sneaky extras.
              Not a lab test.
            </p>
          </div>
        </div>

        <label className="btn-secondary inline-flex cursor-pointer">
          <Camera className="h-4 w-4" />
          {ocrBusy ? "Reading photo…" : "Photo or camera"}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            disabled={ocrBusy || pending}
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </label>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="input min-h-[8rem]"
          placeholder="Paste an ingredient list or menu line…"
        />
        <button
          type="button"
          className="btn-primary"
          disabled={pending || ocrBusy || !text.trim()}
          onClick={() => runScan("paste", text)}
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardPaste className="h-4 w-4" />}
          Check ingredients
        </button>

        {error && (
          <p className="text-sm text-rose-600" role="alert">
            {error}
          </p>
        )}

        {result && (
          <div
            className={cn(
              "rounded-2xl border p-4",
              result.verdict === "unsafe" && "border-rose-300 bg-rose-50/80 dark:border-rose-500/30 dark:bg-rose-500/10",
              result.verdict === "caution" &&
                "border-amber-300 bg-amber-50/80 dark:border-amber-500/30 dark:bg-amber-500/10",
              result.verdict === "safe" &&
                "border-emerald-300 bg-emerald-50/80 dark:border-emerald-500/30 dark:bg-emerald-500/10"
            )}
          >
            <p className="font-display text-lg font-semibold">{verdictLabel(result.verdict)}</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
              {result.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-[11px] text-sage-400">
          Heuristic only — packaging changes, shared equipment, and “may contain” statements still matter. When in
          doubt, skip it or ask the maker. Not a diagnosis and not lab-grade certainty.
        </p>
      </div>

      {history.length > 0 && (
        <div className="card p-5">
          <h3 className="font-display font-semibold text-sage-900 dark:text-white">Your scan history</h3>
          <p className="text-xs text-sage-400">Private to you.</p>
          <ul className="mt-3 space-y-2">
            {history.map((h) => (
              <li key={h.id} className="flex items-start gap-2 rounded-xl bg-white/60 p-3 text-sm dark:bg-white/5">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold capitalize">{h.verdict}</p>
                  <p className="truncate text-sage-500">{h.preview}</p>
                  <p className="text-[11px] text-sage-400">{timeAgo(h.createdAt)}</p>
                </div>
                <button
                  type="button"
                  className="btn-ghost p-1.5 text-rose-500"
                  aria-label="Delete scan"
                  onClick={() => {
                    start(async () => {
                      await deleteLabelScan(h.id);
                      setHistory((prev) => prev.filter((x) => x.id !== h.id));
                    });
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
