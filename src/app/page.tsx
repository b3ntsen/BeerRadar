"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { venues } from "@/lib/data/venues";
import { getVenueWithCheapest } from "@/lib/utils";
import { loadUserPrices, saveUserPrice, UserPrice } from "@/lib/userPrices";
import VenuePanel from "@/components/map/VenuePanel";
import VenueList from "@/components/map/VenueList";
import { Search, Beer, SlidersHorizontal, Sun, Moon, Navigation } from "lucide-react";
import { VenueWithCheapest } from "@/types";
import { beers } from "@/lib/data/beers";

const VenueMap = dynamic(() => import("@/components/map/VenueMap"), { ssr: false });

type SortOption = "price_asc" | "price_desc" | "name" | "distance" | "price_per_liter";

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [sort, setSort] = useState<SortOption>("price_asc");
  const [userPrices, setUserPrices] = useState<UserPrice[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sidebarTab, setSidebarTab] = useState<"list" | "map">("map");
  const [darkMode, setDarkMode] = useState(false);
  const [beerTypeFilter, setBeerTypeFilter] = useState<string>("Alle");

  useEffect(() => {
    setUserPrices(loadUserPrices());
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
    // Load dark mode preference
    const stored = localStorage.getItem("beerradar-darkmode");
    if (stored === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("beerradar-darkmode", String(next));
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const beerTypes = useMemo(() => {
    const types = new Set<string>();
    beers.forEach((b) => types.add(b.type));
    return ["Alle", ...Array.from(types).sort()];
  }, []);

  const allVenues: VenueWithCheapest[] = useMemo(() => {
    return venues.map((v) => {
      const base = getVenueWithCheapest(v);
      if (userLocation) {
        const dist = haversineKm(
          userLocation.lat,
          userLocation.lng,
          v.coordinates.lat,
          v.coordinates.lng
        );
        return { ...base, distance: Math.round(dist * 10) / 10 };
      }
      return base;
    });
  }, [userLocation]);

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
    if (beerTypeFilter !== "Alle") {
      result = result.filter((v) =>
        v.beers.some((bp) => {
          const beer = beers.find((b) => b.id === bp.beerId);
          return beer?.type === beerTypeFilter;
        })
      );
    }
    return [...result].sort((a, b) => {
      if (sort === "price_asc") return a.cheapestBeer.priceNok - b.cheapestBeer.priceNok;
      if (sort === "price_desc") return b.cheapestBeer.priceNok - a.cheapestBeer.priceNok;
      if (sort === "price_per_liter") return a.cheapestPricePerLiter - b.cheapestPricePerLiter;
      if (sort === "distance") {
        const da = a.distance ?? Infinity;
        const db = b.distance ?? Infinity;
        return da - db;
      }
      return a.name.localeCompare(b.name);
    });
  }, [allVenues, query, onlyOpen, sort, beerTypeFilter]);

  const selectedVenue = filteredVenues.find((v) => v.id === selectedId) ?? null;

  const handleAddPrice = (beerId: string, priceNok: number, sizeML: number) => {
    if (!selectedId) return;
    const updated = saveUserPrice(selectedId, beerId, priceNok, sizeML);
    setUserPrices(updated);
  };

  const handleNearestOpen = () => {
    setOnlyOpen(true);
    setSort("distance");
    setQuery("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-amber-400 dark:bg-amber-700 px-4 py-3 shadow-md flex items-center gap-3 z-10">
        <Beer size={24} className="text-amber-900 dark:text-amber-100" />
        <h1 className="text-xl font-extrabold text-amber-900 dark:text-amber-100 tracking-tight">BeerRadar</h1>
        <p className="text-amber-800 dark:text-amber-200 text-sm hidden sm:block">Finn billigste øl i nærheten</p>
        <div className="ml-auto flex items-center gap-2">
          {userLocation && (
            <button
              onClick={handleNearestOpen}
              className="flex items-center gap-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 dark:bg-amber-800 dark:hover:bg-amber-900 text-white px-3 py-1.5 rounded-full transition-colors"
              title="Vis nærmeste åpne bar"
            >
              <Navigation size={12} />
              Nærmeste åpne
            </button>
          )}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-amber-500 hover:bg-amber-600 dark:bg-amber-800 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-100 transition-colors"
            title={darkMode ? "Bytt til lyst modus" : "Bytt til mørkt modus"}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Search + filters */}
      <div className="bg-white dark:bg-gray-800 px-4 py-2 shadow-sm flex flex-wrap items-center gap-2 z-10">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Søk etter bar, by eller øl..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (e.target.value) setSidebarTab("list"); }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <label className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
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
            className="text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="price_asc">Billigst først</option>
            <option value="price_desc">Dyrest først</option>
            <option value="price_per_liter">Billigst per liter</option>
            <option value="name">Navn A-Å</option>
            {userLocation && <option value="distance">Nærmest</option>}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <Beer size={14} className="text-gray-400" />
          <select
            value={beerTypeFilter}
            onChange={(e) => setBeerTypeFilter(e.target.value)}
            className="text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {beerTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <span className="text-xs text-gray-400 ml-auto">{filteredVenues.length} steder</span>
      </div>

      {/* Mobile tabs */}
      <div className="flex sm:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setSidebarTab("map")}
          className={`flex-1 py-2 text-sm font-medium ${sidebarTab === "map" ? "text-amber-600 border-b-2 border-amber-500" : "text-gray-500 dark:text-gray-400"}`}
        >
          Kart
        </button>
        <button
          onClick={() => setSidebarTab("list")}
          className={`flex-1 py-2 text-sm font-medium ${sidebarTab === "list" ? "text-amber-600 border-b-2 border-amber-500" : "text-gray-500 dark:text-gray-400"}`}
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
          } sm:flex flex-col w-full sm:w-80 lg:w-96 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-hidden`}
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
