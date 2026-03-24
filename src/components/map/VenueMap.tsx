"use client";

import { useEffect, useRef } from "react";
import { VenueWithCheapest } from "@/types";
import { formatNok } from "@/lib/utils";

interface Props {
  venues: VenueWithCheapest[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  userLocation: { lat: number; lng: number } | null;
}

export default function VenueMap({ venues, selectedId, onSelect, userLocation }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<Map<string, import("leaflet").Marker>>(new Map());

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      // Fix default marker icon issue with Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      if (mapInstanceRef.current) return;

      const center = userLocation
        ? [userLocation.lat, userLocation.lng]
        : [59.9139, 10.7522]; // Oslo center

      const map = L.map(mapRef.current!).setView(center as [number, number], 14);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      if (userLocation) {
        const userIcon = L.divIcon({
          className: "",
          html: `<div class="w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup("Din posisjon");
      }

      venues.forEach((venue) => {
        const isSelected = venue.id === selectedId;
        const icon = L.divIcon({
          className: "",
          html: createMarkerHtml(venue, isSelected),
          iconSize: [44, 44],
          iconAnchor: [22, 44],
        });

        const marker = L.marker([venue.coordinates.lat, venue.coordinates.lng], { icon })
          .addTo(map)
          .on("click", () => onSelect(venue.id));

        markersRef.current.set(venue.id, marker);
      });
    };

    initMap();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker styles when selection changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;
      venues.forEach((venue) => {
        const marker = markersRef.current.get(venue.id);
        if (!marker) return;
        const isSelected = venue.id === selectedId;
        const icon = L.divIcon({
          className: "",
          html: createMarkerHtml(venue, isSelected),
          iconSize: [44, 44],
          iconAnchor: [22, 44],
        });
        marker.setIcon(icon);
      });

      if (selectedId && mapInstanceRef.current) {
        const venue = venues.find((v) => v.id === selectedId);
        if (venue) {
          mapInstanceRef.current.panTo([venue.coordinates.lat, venue.coordinates.lng]);
        }
      }
    };
    updateMarkers();
  }, [selectedId, venues]);

  return <div ref={mapRef} className="w-full h-full rounded-xl" />;
}

function createMarkerHtml(venue: VenueWithCheapest, isSelected: boolean): string {
  const price = formatNok(venue.cheapestBeer.priceNok);
  const bg = isSelected ? "bg-amber-500" : venue.openNow ? "bg-amber-400" : "bg-gray-400";
  const ring = isSelected ? "ring-2 ring-amber-700" : "";
  return `
    <div class="flex flex-col items-center">
      <div class="px-2 py-1 ${bg} ${ring} text-white text-xs font-bold rounded-full shadow-md whitespace-nowrap">
        ${price}
      </div>
      <div class="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent ${isSelected ? "border-t-amber-500" : venue.openNow ? "border-t-amber-400" : "border-t-gray-400"}"></div>
    </div>
  `;
}
