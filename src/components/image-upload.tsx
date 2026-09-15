"use client";

import { useState, useTransition } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { uploadImage, type UploadFolder } from "@/lib/actions/upload";

export function ImageUpload({
  name,
  folder,
  value,
  onChange,
  label = "Photo",
}: {
  name: string;
  folder: UploadFolder;
  value?: string;
  onChange?: (url: string) => void;
  label?: string;
}) {
  const [url, setUrl] = useState(value || "");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-1">
      <input type="hidden" name={name} value={url} />
      <label className="btn-ghost inline-flex cursor-pointer text-sm">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        {pending ? "Uploading…" : label}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          disabled={pending}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            const fd = new FormData();
            fd.set("file", file);
            fd.set("folder", folder);
            setError(null);
            start(async () => {
              const res = await uploadImage(fd);
              if ("error" in res && res.error) {
                setError(res.error);
                return;
              }
              if ("url" in res) {
                setUrl(res.url);
                onChange?.(res.url);
              }
            });
          }}
        />
      </label>
      {url ? <p className="truncate text-[11px] text-sage-400">{url}</p> : null}
      {error ? (
        <p className="text-xs text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
