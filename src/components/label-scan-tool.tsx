"use client";

import { useState, useTransition } from "react";
import { Camera, ClipboardPaste, Loader2, ScanLine, Trash2, Barcode } from "lucide-react";
import {
  deleteLabelScan,
  reportScanMiss,
  scanBarcode,
  scanIngredients,
} from "@/lib/actions/scan";
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
  const [barcode, setBarcode] = useState("");
  const [pending, start] = useTransition();
  const [ocrBusy, setOcrBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    id?: string | null;
    verdict: ScanVerdict;
    reasons: string[];
    hits: { token: string; severity: string; reason: string }[];
    ocrText?: string;
    productName?: string | null;
  } | null>(null);
  const [history, setHistory] = useState(initialHistory);
  const [missNote, setMissNote] = useState("");
  const [missed, setMissed] = useState(false);

  function applyResult(res: {
    ok?: boolean;
    error?: string;
    id?: string | null;
    verdict?: ScanVerdict;
    reasons?: string[];
    hits?: { token: string; severity: string; reason: string }[];
    ocrText?: string;
    product?: { name: string } | null;
  }, source: string, preview: string) {
    if (res.error) {
      setError(res.error);
      return;
    }
    if (!res.ok || !res.verdict) return;
    setResult({
      id: res.id,
      verdict: res.verdict,
      reasons: res.reasons || [],
      hits: res.hits || [],
      ocrText: res.ocrText,
      productName: res.product?.name ?? null,
    });
    if (res.id) {
      setHistory((prev) => [
        {
          id: res.id!,
          source,
          verdict: res.verdict!,
          reasons: res.reasons || [],
          preview: preview.slice(0, 140),
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
  }

  function runScan(source: "image" | "paste", value: string) {
    setError(null);
    setMissed(false);
    start(async () => {
      const res = await scanIngredients({ text: value, source, persist: true });
      applyResult(res, source, value);
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
              Photo, barcode (Open Food Facts CA/world), or paste. Heuristic gluten check — not a lab.
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

        <div className="flex flex-wrap gap-2">
          <input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            className="input flex-1"
            inputMode="numeric"
            placeholder="Barcode (8–14 digits)"
          />
          <button
            type="button"
            className="btn-secondary"
            disabled={pending || barcode.replace(/\D/g, "").length < 8}
            onClick={() => {
              setError(null);
              setMissed(false);
              start(async () => {
                const res = await scanBarcode(barcode);
                applyResult(res, "barcode", barcode);
                if ("ocrText" in res && res.ocrText) setText(res.ocrText);
              });
            }}
          >
            <Barcode className="h-4 w-4" />
            Look up
          </button>
        </div>

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
                "border-emerald-300 bg-emerald-50/80 dark:border-emerald-500/30 dark:bg-emerald-500/10",
              result.verdict === "unknown" &&
                "border-sage-300 bg-sage-50/80 dark:border-white/10 dark:bg-white/5"
            )}
          >
            <p className="font-display text-lg font-semibold">{verdictLabel(result.verdict)}</p>
            {result.productName ? (
              <p className="text-sm text-sage-600">{result.productName}</p>
            ) : null}
            {result.ocrText ? (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium">What we read</summary>
                <pre className="mt-1 whitespace-pre-wrap text-xs text-sage-600">{result.ocrText}</pre>
              </details>
            ) : null}
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
              {result.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <div className="mt-3 space-y-2">
              <textarea
                value={missNote}
                onChange={(e) => setMissNote(e.target.value)}
                className="input min-h-[3rem] text-sm"
                placeholder="Wrong call? Tell us what the pack actually says…"
              />
              <button
                type="button"
                className="btn-ghost text-sm"
                disabled={missed || pending}
                onClick={() =>
                  start(async () => {
                    await reportScanMiss({
                      scanId: result.id || undefined,
                      barcode: barcode || undefined,
                      rawText: result.ocrText || text,
                      note: missNote,
                    });
                    setMissed(true);
                  })
                }
              >
                {missed ? "Thanks — we'll review" : "Report a miss"}
              </button>
            </div>
          </div>
        )}

        <p className="text-[11px] text-sage-400">
          Heuristic only — packaging changes, shared equipment, and “may contain” statements still matter. When in
          doubt, skip it or ask the maker. Not a diagnosis and not lab-grade certainty. Scans older than 90 days
          are deleted unless you keep history on Profile.
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
