"use client";

import { useState, useTransition } from "react";
import { Download, Loader2, Trash2 } from "lucide-react";
import { deleteMyAccount, exportMyData } from "@/lib/actions/account";
import { updateNotificationPrefs } from "@/lib/actions/profile";

export type NotifPrefs = {
  notifyDms: boolean;
  notifyBuddy: boolean;
  notifyCheckin: boolean;
  notifyDining: boolean;
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
  keepScanHistory: boolean;
};

export function AccountSettings({ username, prefs }: { username: string; prefs: NotifPrefs }) {
  const [pending, start] = useTransition();
  const [exportError, setExportError] = useState<string | null>(null);
  const [prefError, setPrefError] = useState<string | null>(null);
  const [prefSaved, setPrefSaved] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <section className="card space-y-3 p-5">
        <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">
          Notifications
        </h2>
        <p className="text-sm text-sage-500">
          In-app always stores a copy. Push and sounds respect these toggles and quiet hours (your
          local clock).
        </p>
        <form
          className="space-y-3"
          action={(fd) => {
            setPrefError(null);
            setPrefSaved(false);
            start(async () => {
              const res = await updateNotificationPrefs(fd);
              if (res?.error) setPrefError(res.error);
              else setPrefSaved(true);
            });
          }}
        >
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="notifyDms" defaultChecked={prefs.notifyDms} />
            Direct messages
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="notifyBuddy" defaultChecked={prefs.notifyBuddy} />
            Buddy matches
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="notifyCheckin" defaultChecked={prefs.notifyCheckin} />
            Need-a-check-in nudges
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="notifyDining" defaultChecked={prefs.notifyDining} />
            Dining incidents near me
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="keepScanHistory" defaultChecked={prefs.keepScanHistory} />
            Keep label scans past 90 days
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-sage-500">Quiet hours start</label>
              <select
                name="quietHoursStart"
                defaultValue={prefs.quietHoursStart ?? ""}
                className="input mt-1"
              >
                <option value="">Off</option>
                {Array.from({ length: 24 }, (_, h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-sage-500">Quiet hours end</label>
              <select
                name="quietHoursEnd"
                defaultValue={prefs.quietHoursEnd ?? ""}
                className="input mt-1"
              >
                <option value="">Off</option>
                {Array.from({ length: 24 }, (_, h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </div>
          </div>
          {prefError ? <p className="text-sm text-rose-600">{prefError}</p> : null}
          {prefSaved ? <p className="text-sm text-emerald-600">Saved.</p> : null}
          <button type="submit" className="btn-secondary" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save notification prefs
          </button>
        </form>
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">
          Export your data
        </h2>
        <p className="text-sm text-sage-500">
          ZIP with JSON (account, journal, scans, messages you sent) plus a GF-cost CSV. Health logs
          stay yours.
        </p>
        <button
          type="button"
          className="btn-secondary"
          disabled={pending}
          onClick={() => {
            setExportError(null);
            start(async () => {
              try {
                const res = await exportMyData();
                const bin = Uint8Array.from(atob(res.base64), (c) => c.charCodeAt(0));
                const blob = new Blob([bin], { type: "application/zip" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = res.filename;
                a.click();
                URL.revokeObjectURL(url);
              } catch {
                setExportError("Couldn't export right now.");
              }
            });
          }}
        >
          <Download className="h-4 w-4" />
          Download ZIP
        </button>
        {exportError ? <p className="text-sm text-rose-600">{exportError}</p> : null}
      </section>

      <section className="card space-y-3 border-rose-200/70 p-5 dark:border-rose-500/20">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-rose-700 dark:text-rose-300">
          <Trash2 className="h-4 w-4" />
          Delete account
        </h2>
        <p className="text-sm text-sage-500">
          Permanently removes your profile, posts, DMs you sent, and private logs. Type{" "}
          <span className="font-semibold">{username}</span> to confirm.
        </p>
        <form
          className="space-y-2"
          action={(fd) => {
            setDeleteError(null);
            start(async () => {
              const res = await deleteMyAccount(fd);
              if (res?.error) setDeleteError(res.error);
            });
          }}
        >
          <input name="confirm" className="input" placeholder={username} autoComplete="off" />
          {deleteError ? <p className="text-sm text-rose-600">{deleteError}</p> : null}
          <button type="submit" className="btn-secondary text-rose-600" disabled={pending}>
            Delete my account
          </button>
        </form>
      </section>
    </div>
  );
}
