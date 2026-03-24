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
  beers: BeerPrice[];
}

export interface VenueWithCheapest extends Venue {
  cheapestBeer: BeerPrice & { beer: Beer };
  cheapestPricePerLiter: number;
}
