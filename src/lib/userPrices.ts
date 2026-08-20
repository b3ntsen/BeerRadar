"use client";

export interface UserPrice {
  id: string;
  venueId: string;
  beerId: string;
  priceNok: number;
  sizeML: number;
  photoBase64?: string;
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
  sizeML: number,
  photoBase64?: string
): UserPrice[] {
  const prices = loadUserPrices();
  const newPrice: UserPrice = {
    id: `${Date.now()}`,
    venueId,
    beerId,
    priceNok,
    sizeML,
    photoBase64,
    submittedAt: new Date().toISOString(),
  };
  const updated = [newPrice, ...prices];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function compressImage(file: File, maxWidth = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
