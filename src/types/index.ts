export interface Beer {
  id: string;
  name: string;
  type: string; // "Pilsner", "IPA", "Lager", "Wheat", etc.
  abv: number;
}

export interface BeerPrice {
  beerId: string;
  priceNok: number;
  sizeML: number;
  pricePerLiter: number;
  happyHour?: { start: string; end: string; discount: number };
}

export interface Venue {
  id: string;
  name: string;
  type: "bar" | "pub" | "restaurant" | "nightclub" | "brewery";
  address: string;
  city: string;
  coordinates: { lat: number; lng: number };
  openNow: boolean;
  openingHours: string;
  openingHoursDetailed?: {
    mon?: string;
    tue?: string;
    wed?: string;
    thu?: string;
    fri?: string;
    sat?: string;
    sun?: string;
  };
  beers: BeerPrice[];
}

export interface VenueWithCheapest extends Venue {
  cheapestBeer: BeerPrice & { beer: Beer };
  cheapestPricePerLiter: number;
  distance?: number; // km
}
