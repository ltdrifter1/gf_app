"use client";

import { useState } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/maplibre";
import { OSM_STYLE } from "./map-style";
import { Avatar } from "./ui/avatar";

type MemberPin = { id: string; name: string; lat: number; lng: number; location: string | null; avatarUrl: string | null };

export function CommunityMap({ members }: { members: MemberPin[] }) {
  const [popup, setPopup] = useState<MemberPin | null>(null);
  const center = members.length
    ? { lng: members.reduce((s, m) => s + m.lng, 0) / members.length, lat: members.reduce((s, m) => s + m.lat, 0) / members.length }
    : { lng: -98.5, lat: 39.8 };

  return (
    <div className="h-full w-full overflow-hidden rounded-3xl">
      <Map
        initialViewState={{ longitude: center.lng, latitude: center.lat, zoom: 3.6 }}
        mapStyle={OSM_STYLE}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" showCompass={false} />
        {members.map((m) => (
          <Marker key={m.id} longitude={m.lng} latitude={m.lat} anchor="center" onClick={(e) => { e.originalEvent.stopPropagation(); setPopup(m); }}>
            <div className="cursor-pointer rounded-full ring-2 ring-white shadow-glass transition hover:scale-110">
              <Avatar name={m.name} src={m.avatarUrl} size={36} />
            </div>
          </Marker>
        ))}
        {popup && (
          <Popup longitude={popup.lng} latitude={popup.lat} anchor="bottom" offset={24} closeButton={false} onClose={() => setPopup(null)}>
            <div className="flex items-center gap-2 p-3">
              <Avatar name={popup.name} src={popup.avatarUrl} size={36} />
              <div>
                <p className="text-sm font-semibold text-sage-900">{popup.name}</p>
                <p className="text-xs text-sage-500">{popup.location}</p>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
