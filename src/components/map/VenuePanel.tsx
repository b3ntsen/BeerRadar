"use client";

import { useState } from "react";
import { VenueWithCheapest } from "@/types";
import { formatNok, getBeerName, venueTypeLabel } from "@/lib/utils";
import { X, Clock, MapPin, Plus, Beer, ChevronUp, ChevronDown } from "lucide-react";
import { beers } from "@/lib/data/beers";
import { UserPrice } from "@/lib/userPrices";

interface Props {
  venue: VenueWithCheapest;
  userPrices: UserPrice[];
  onClose: () => void;
  onAddPrice: (beerId: string, priceNok: number, sizeML: number) => void;
}

export default function VenuePanel({ venue, userPrices, onClose, onAddPrice }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [beerId, setBeerId] = useState(beers[0].id);
  const [price, setPrice] = useState("");
  const [size, setSize] = useState("500");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(price);
    const s = parseInt(size);
    if (!p || !s || p <= 0) return;
    onAddPrice(beerId, p, s);
    setPrice("");
    setShowForm(false);
  };

  const allPrices = [
    ...venue.beers.map((bp) => ({
      beerId: bp.beerId,
      priceNok: bp.priceNok,
      sizeML: bp.sizeML,
      pricePerLiter: bp.pricePerLiter,
      isUserSubmitted: false,
      name: getBeerName(bp.beerId),
    })),
    ...userPrices
      .filter((up) => up.venueId === venue.id)
      .map((up) => ({
        beerId: up.beerId,
        priceNok: up.priceNok,
        sizeML: up.sizeML,
        pricePerLiter: (up.priceNok / up.sizeML) * 1000,
        isUserSubmitted: true,
        name: getBeerName(up.beerId),
      })),
  ].sort((a, b) => a.priceNok - b.priceNok);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-amber-400 px-4 py-3 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium bg-amber-600 text-white px-2 py-0.5 rounded-full">
              {venueTypeLabel(venue.type)}
            </span>
            {venue.openNow ? (
              <span className="text-xs font-medium bg-green-600 text-white px-2 py-0.5 rounded-full">Åpent nå</span>
            ) : (
              <span className="text-xs font-medium bg-gray-600 text-white px-2 py-0.5 rounded-full">Stengt</span>
            )}
          </div>
          <h2 className="text-lg font-bold text-amber-900 mt-1">{venue.name}</h2>
        </div>
        <button onClick={onClose} className="text-amber-800 hover:text-amber-900 p-1">
          <X size={20} />
        </button>
      </div>

      {/* Info */}
      <div className="px-4 py-2 border-b border-gray-100 text-sm text-gray-600 space-y-1">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-gray-400 shrink-0" />
          <span>{venue.address}, {venue.city}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-gray-400 shrink-0" />
          <span>{venue.openingHours}</span>
        </div>
      </div>

      {/* Cheapest highlight */}
      <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
        <p className="text-xs text-amber-700 font-medium uppercase tracking-wide">Billigste øl</p>
        <div className="flex items-center justify-between mt-1">
          <span className="font-semibold text-gray-800">{venue.cheapestBeer.beer.name}</span>
          <span className="text-xl font-bold text-amber-600">{formatNok(venue.cheapestBeer.priceNok)}</span>
        </div>
        <p className="text-xs text-gray-500">{venue.cheapestBeer.sizeML}ml · {venue.cheapestBeer.pricePerLiter.toFixed(0)} kr/L</p>
      </div>

      {/* Beer list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
            <Beer size={12} /> Prisliste
          </p>
          <span className="text-xs text-gray-400">{allPrices.length} øl</span>
        </div>
        {allPrices.map((bp, i) => (
          <div
            key={`${bp.beerId}-${i}`}
            className={`flex items-center justify-between py-2 px-3 rounded-lg ${
              i === 0 ? "bg-amber-50 border border-amber-200" : "bg-gray-50"
            }`}
          >
            <div>
              <p className="text-sm font-medium text-gray-800">{bp.name}</p>
              <p className="text-xs text-gray-500">
                {bp.sizeML}ml · {bp.pricePerLiter.toFixed(0)} kr/L
                {bp.isUserSubmitted && (
                  <span className="ml-1 text-blue-500 font-medium">· Innmeldt</span>
                )}
              </p>
            </div>
            <span className={`font-bold text-base ${i === 0 ? "text-amber-600" : "text-gray-700"}`}>
              {formatNok(bp.priceNok)}
            </span>
          </div>
        ))}
      </div>

      {/* Add price */}
      <div className="border-t border-gray-200 px-4 py-3">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-amber-400 hover:bg-amber-500 text-white font-semibold rounded-lg text-sm transition-colors"
        >
          <Plus size={16} />
          Meld inn pris
          {showForm ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-3 space-y-2">
            <select
              value={beerId}
              onChange={(e) => setBeerId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {beers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Pris (kr)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min={1}
                  step={1}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div className="w-28">
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="330">330 ml</option>
                  <option value="400">400 ml</option>
                  <option value="500">500 ml</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg text-sm transition-colors"
            >
              Lagre pris
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
