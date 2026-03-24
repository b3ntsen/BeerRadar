"use client";

export interface UserPrice {
  id: string;
  venueId: string;
  beerId: string;
  priceNok: number;
  sizeML: number;
  submittedAt: string;
}

const STORAGE_KEY = "beerradar_user_prices";

export function loadUserPrices(): UserPrice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUserPrice(
  venueId: string,
  beerId: string,
  priceNok: number,
  sizeML: number
): UserPrice[] {
  const prices = loadUserPrices();
  const newPrice: UserPrice = {
    id: `${Date.now()}`,
    venueId,
    beerId,
    priceNok,
    sizeML,
    submittedAt: new Date().toISOString(),
  };
  const updated = [newPrice, ...prices];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
