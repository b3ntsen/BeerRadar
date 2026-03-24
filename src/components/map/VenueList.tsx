"use client";

import { VenueWithCheapest } from "@/types";
import { formatNok, venueTypeLabel } from "@/lib/utils";
import { MapPin } from "lucide-react";

interface Props {
  venues: VenueWithCheapest[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function VenueList({ venues, selectedId, onSelect }: Props) {
  if (venues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-500 text-sm">
        <MapPin size={24} className="mb-2" />
        Ingen steder funnet
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3 overflow-y-auto h-full">
      {venues.map((venue) => (
        <button
          key={venue.id}
          onClick={() => onSelect(venue.id)}
          className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
            selectedId === venue.id
              ? "border-amber-400 bg-amber-50 dark:bg-amber-900/30 shadow-sm"
              : "border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs text-gray-400 dark:text-gray-500">{venueTypeLabel(venue.type)}</span>
                {venue.openNow ? (
                  <span className="text-xs text-green-600 font-medium">· Åpent</span>
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-500">· Stengt</span>
                )}
                {venue.distance !== undefined && (
                  <span className="text-xs text-blue-500 font-medium">· {venue.distance.toFixed(1)} km</span>
                )}
              </div>
              <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{venue.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{venue.address}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-amber-600">{formatNok(venue.cheapestBeer.priceNok)}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{venue.cheapestBeer.beer.name}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
