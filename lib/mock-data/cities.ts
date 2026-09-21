/**
 * CineBook v2 — Demo Cities Dataset
 * Location-first marketplace discovery data
 */

export interface City {
  id: string;
  name: string;
  state: string;
  isPopular: boolean;
}

export const CITIES: City[] = [
  { id: "ahmedabad", name: "Ahmedabad", state: "Gujarat", isPopular: true },
  { id: "gandhinagar", name: "Gandhinagar", state: "Gujarat", isPopular: true },
  { id: "vadodara", name: "Vadodara", state: "Gujarat", isPopular: true },
  { id: "surat", name: "Surat", state: "Gujarat", isPopular: true },
  { id: "mumbai", name: "Mumbai", state: "Maharashtra", isPopular: true },
  { id: "delhi", name: "Delhi-NCR", state: "Delhi", isPopular: true },
  { id: "bengaluru", name: "Bengaluru", state: "Karnataka", isPopular: true },
  { id: "pune", name: "Pune", state: "Maharashtra", isPopular: true },
  { id: "hyderabad", name: "Hyderabad", state: "Telangana", isPopular: true },
  { id: "chennai", name: "Chennai", state: "Tamil Nadu", isPopular: true },
  { id: "rajkot", name: "Rajkot", state: "Gujarat", isPopular: false },
  { id: "jaipur", name: "Jaipur", state: "Rajasthan", isPopular: false },
  { id: "kolkata", name: "Kolkata", state: "West Bengal", isPopular: false },
];

export const DEFAULT_CITY = CITIES[0]; // Ahmedabad
