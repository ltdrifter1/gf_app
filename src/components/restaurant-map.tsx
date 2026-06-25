"use client";

import { useMemo, useState } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/maplibre";
import Link from "next/link";
import { OSM_STYLE } from "./map-style";
import { safetyColor, safetyLabel } from "@/lib/utils";

export type MapPin = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  score: number;
  city: string;
  imageUrl: string | null;
  celiacSafe: boolean;
};

export function RestaurantMap({
  pins,
  activeId,
  onSelect,
  height = "100%",
}: {
  pins: MapPin[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
  height?: string;
}) {
  const [popup, setPopup] = useState<MapPin | null>(null);

  const center = useMemo(() => {
    if (pins.length === 0) return { lng: -98.5, lat: 39.8, zoom: 3.4 };
    const lng = pins.reduce((s, p) => s + p.lng, 0) / pins.length;
    const lat = pins.reduce((s, p) => s + p.lat, 0) / pins.length;
    return { lng, lat, zoom: pins.length > 1 ? 10 : 12 };
  }, [pins]);

  return (
    <div className="h-full w-full overflow-hidden rounded-3xl" style={{ height }}>
      <Map
        initialViewState={{ longitude: center.lng, latitude: center.lat, zoom: center.zoom }}
        mapStyle={OSM_STYLE}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" showCompass={false} />
        {pins.map((p) => (
          <Marker
            key={p.id}
            longitude={p.lng}
            latitude={p.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setPopup(p);
              onSelect?.(p.id);
            }}
          >
            <button
              className={`grid place-items-center rounded-full px-2.5 py-1 text-xs font-bold shadow-glass transition hover:scale-110 ${
                activeId === p.id
                  ? "bg-brand-600 text-white ring-2 ring-white"
                  : "bg-white text-sage-800"
              }`}
            >
              {p.score}
            </button>
          </Marker>
        ))}

        {popup && (
          <Popup
            longitude={popup.lng}
            latitude={popup.lat}
            anchor="bottom"
            offset={28}
            closeButton={false}
            onClose={() => setPopup(null)}
          >
            <Link href={`/app/restaurants/${popup.id}`} className="block w-52">
              {popup.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={popup.imageUrl} alt={popup.name} className="h-24 w-full object-cover" />
              )}
              <div className="p-3">
                <p className="font-semibold text-sage-900">{popup.name}</p>
                <p className="text-xs text-sage-500">{popup.city}</p>
                <p className={`mt-1 text-xs font-semibold ${safetyColor(popup.score)}`}>
                  {popup.score}% · {safetyLabel(popup.score)}
                </p>
              </div>
            </Link>
          </Popup>
        )}
      </Map>
    </div>
  );
}
