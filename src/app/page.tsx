"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { venues } from "@/lib/data/venues";
import { getVenueWithCheapest } from "@/lib/utils";
import { loadUserPrices, saveUserPrice, UserPrice } from "@/lib/userPrices";
import VenuePanel from "@/components/map/VenuePanel";
import VenueList from "@/components/map/VenueList";
import { Search, Beer, SlidersHorizontal } from "lucide-react";
import { VenueWithCheapest } from "@/types";

const VenueMap = dynamic(() => import("@/components/map/VenueMap"), { ssr: false });

type SortOption = "price_asc" | "price_desc" | "name";

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [sort, setSort] = useState<SortOption>("price_asc");
  const [userPrices, setUserPrices] = useState<UserPrice[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sidebarTab, setSidebarTab] = useState<"list" | "map">("map");

  useEffect(() => {
    setUserPrices(loadUserPrices());
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const allVenues: VenueWithCheapest[] = useMemo(() => {
    return venues.map(getVenueWithCheapest);
  }, []);

  const filteredVenues = useMemo(() => {
    let result = allVenues;
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q) ||
          v.beers.some((b) => b.beerId.toLowerCase().includes(q))
      );
    }
    if (onlyOpen) {
      result = result.filter((v) => v.openNow);
    }
    return [...result].sort((a, b) => {
      if (sort === "price_asc") return a.cheapestBeer.priceNok - b.cheapestBeer.priceNok;
      if (sort === "price_desc") return b.cheapestBeer.priceNok - a.cheapestBeer.priceNok;
      return a.name.localeCompare(b.name);
    });
  }, [allVenues, query, onlyOpen, sort]);

  const selectedVenue = filteredVenues.find((v) => v.id === selectedId) ?? null;

  const handleAddPrice = (beerId: string, priceNok: number, sizeML: number) => {
    if (!selectedId) return;
    const updated = saveUserPrice(selectedId, beerId, priceNok, sizeML);
    setUserPrices(updated);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-amber-400 px-4 py-3 shadow-md flex items-center gap-3 z-10">
        <Beer size={24} className="text-amber-900" />
        <h1 className="text-xl font-extrabold text-amber-900 tracking-tight">BeerRadar</h1>
        <p className="text-amber-800 text-sm hidden sm:block">Finn billigste øl i nærheten</p>
      </header>

      {/* Search + filters */}
      <div className="bg-white px-4 py-2 shadow-sm flex flex-wrap items-center gap-2 z-10">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Søk etter bar, by eller øl..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyOpen}
            onChange={(e) => setOnlyOpen(e.target.checked)}
            className="accent-amber-500"
          />
          Kun åpne
        </label>
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal size={14} className="text-gray-400" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="price_asc">Billigst først</option>
            <option value="price_desc">Dyrest først</option>
            <option value="name">Navn A-Å</option>
          </select>
        </div>
        <span className="text-xs text-gray-400 ml-auto">{filteredVenues.length} steder</span>
      </div>

      {/* Mobile tabs */}
      <div className="flex sm:hidden bg-white border-b border-gray-200">
        <button
          onClick={() => setSidebarTab("map")}
          className={`flex-1 py-2 text-sm font-medium ${sidebarTab === "map" ? "text-amber-600 border-b-2 border-amber-500" : "text-gray-500"}`}
        >
          Kart
        </button>
        <button
          onClick={() => setSidebarTab("list")}
          className={`flex-1 py-2 text-sm font-medium ${sidebarTab === "list" ? "text-amber-600 border-b-2 border-amber-500" : "text-gray-500"}`}
        >
          Liste
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (list) */}
        <aside
          className={`${
            sidebarTab === "list" ? "flex" : "hidden"
          } sm:flex flex-col w-full sm:w-80 lg:w-96 bg-gray-50 border-r border-gray-200 overflow-y-auto`}
        >
          {selectedVenue ? (
            <VenuePanel
              venue={selectedVenue}
              userPrices={userPrices}
              onClose={() => setSelectedId(null)}
              onAddPrice={handleAddPrice}
            />
          ) : (
            <VenueList
              venues={filteredVenues}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id);
                setSidebarTab("map");
              }}
            />
          )}
        </aside>

        {/* Map */}
        <main className={`${sidebarTab === "map" ? "flex" : "hidden"} sm:flex flex-1 p-3 overflow-hidden`}>
          <VenueMap
            venues={filteredVenues}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              setSidebarTab("list");
            }}
            userLocation={userLocation}
          />
        </main>
      </div>
    </div>
  );
}
