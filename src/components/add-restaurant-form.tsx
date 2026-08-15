"use client";

import { useRef, useState, useTransition } from "react";
import { MapPin, Plus } from "lucide-react";
import { submitRestaurant } from "@/lib/actions/restaurants";
import { cn } from "@/lib/utils";

const FLAGS = [
  { name: "dedicatedKitchen", label: "Dedicated kitchen" },
  { name: "dedicatedFryer", label: "Dedicated fryer" },
  { name: "separatePrepArea", label: "Separate prep" },
  { name: "glutenFreeMenu", label: "GF menu" },
  { name: "certified", label: "GF certified" },
  { name: "celiacSafe", label: "Celiac safe" },
  { name: "delivery", label: "Delivery" },
] as const;

export function AddRestaurantForm({ defaultCity }: { defaultCity?: string | null }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const ref = useRef<HTMLFormElement>(null);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation isn't available in this browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        setError("");
      },
      () => {
        setLocating(false);
        setError("Couldn't read your location — enter lat/lng manually");
      },
      { enableHighAccuracy: true, timeout: 12_000 }
    );
  }

  function onSubmit(formData: FormData) {
    if (coords) {
      formData.set("lat", String(coords.lat));
      formData.set("lng", String(coords.lng));
    }
    startTransition(async () => {
      const res = await submitRestaurant(formData);
      if (res?.error) setError(res.error);
    });
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary">
        <Plus className="h-4 w-4" /> Add a safe spot
      </button>
    );
  }

  return (
    <form ref={ref} action={onSubmit} className="card space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-sage-900 dark:text-white">
            Add a restaurant
          </h2>
          <p className="text-sm text-sage-500">Contribute to the celiac safety graph.</p>
        </div>
        <button type="button" className="btn-ghost text-sm" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required className="input" placeholder="Restaurant name" />
        <input
          name="city"
          required
          className="input"
          placeholder="City"
          defaultValue={defaultCity ?? ""}
        />
        <input name="address" required className="input sm:col-span-2" placeholder="Street address" />
        <input name="cuisine" className="input" placeholder="Cuisine (optional)" />
        <select name="priceLevel" className="input" defaultValue="2">
          <option value="1">$</option>
          <option value="2">$$</option>
          <option value="3">$$$</option>
          <option value="4">$$$$</option>
        </select>
      </div>

      <textarea
        name="description"
        rows={2}
        className="input resize-none"
        placeholder="Why is this spot worth knowing about?"
      />

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn-ghost" onClick={useMyLocation} disabled={locating}>
          <MapPin className="h-4 w-4" />
          {locating ? "Locating…" : "Use my location"}
        </button>
        {coords && (
          <span className="text-xs text-sage-500">
            Pin: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </span>
        )}
      </div>

      {!coords && (
        <div className="grid grid-cols-2 gap-2">
          <input name="lat" required type="number" step="any" className="input" placeholder="Latitude" />
          <input name="lng" required type="number" step="any" className="input" placeholder="Longitude" />
        </div>
      )}
      {coords && (
        <>
          <input type="hidden" name="lat" value={coords.lat} />
          <input type="hidden" name="lng" value={coords.lng} />
        </>
      )}

      <div className="flex flex-wrap gap-2">
        {FLAGS.map((f) => (
          <label
            key={f.name}
            className={cn(
              "chip cursor-pointer border border-sage-200/70 bg-white/60 dark:border-white/10 dark:bg-white/5"
            )}
          >
            <input type="checkbox" name={f.name} className="mr-1" />
            {f.label}
          </label>
        ))}
      </div>

      <input name="imageUrl" type="url" className="input" placeholder="Photo URL (optional)" />

      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Publishing…" : "Publish spot"}
      </button>
    </form>
  );
}
