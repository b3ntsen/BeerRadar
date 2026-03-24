import { Beer } from "@/types";

export const beers: Beer[] = [
  { id: "hansa", name: "Hansa Pilsner", type: "Pilsner", abv: 4.7 },
  { id: "ringnes", name: "Ringnes", type: "Pilsner", abv: 4.7 },
  { id: "tuborg", name: "Tuborg", type: "Pilsner", abv: 4.6 },
  { id: "carlsberg", name: "Carlsberg", type: "Lager", abv: 4.6 },
  { id: "mack", name: "Mack Pilsner", type: "Pilsner", abv: 4.7 },
  { id: "frydenlund", name: "Frydenlund", type: "Pilsner", abv: 4.7 },
  { id: "corona", name: "Corona Extra", type: "Lager", abv: 4.5 },
  { id: "heineken", name: "Heineken", type: "Lager", abv: 5.0 },
  { id: "lervig_rye", name: "Lervig Rye IPA", type: "IPA", abv: 8.5 },
  { id: "nogne_ipa", name: "Nøgne Ø IPA", type: "IPA", abv: 7.5 },
  { id: "aegir_ipa", name: "Ægir IPA", type: "IPA", abv: 6.5 },
  { id: "amundsen_mosaic", name: "Amundsen Mosaic", type: "IPA", abv: 6.0 },
  { id: "guinness", name: "Guinness", type: "Stout", abv: 4.2 },
  { id: "weihenstephaner", name: "Weihenstephaner", type: "Wheat", abv: 5.4 },
  { id: "erdinger", name: "Erdinger Weissbier", type: "Wheat", abv: 5.3 },
];

export const getBeerById = (id: string): Beer | undefined =>
  beers.find((b) => b.id === id);
