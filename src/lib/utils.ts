import { Venue, VenueWithCheapest, BeerPrice } from "@/types";
import { beers, getBeerById } from "./data/beers";

export function formatNok(price: number): string {
  return `kr ${price.toFixed(0)},-`;
}

export function getVenueWithCheapest(venue: Venue): VenueWithCheapest {
  const sorted = [...venue.beers].sort((a, b) => a.priceNok - b.priceNok);
  const cheapest = sorted[0];
  const beer = getBeerById(cheapest.beerId)!;
  return {
    ...venue,
    cheapestBeer: { ...cheapest, beer },
    cheapestPricePerLiter: cheapest.pricePerLiter,
  };
}

export function getBeerName(beerId: string): string {
  return getBeerById(beerId)?.name ?? beerId;
}

export function venueTypeLabel(type: Venue["type"]): string {
  const labels: Record<Venue["type"], string> = {
    bar: "Bar",
    pub: "Pub",
    restaurant: "Restaurant",
    nightclub: "Nattklubb",
    brewery: "Bryggeri",
  };
  return labels[type];
}
