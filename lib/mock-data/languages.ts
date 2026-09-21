/**
 * CineBook v2 — Languages Dataset
 */

export interface LanguageItem {
  id: string;
  name: string;
  nativeName: string;
  count: number;
}

export const LANGUAGES: LanguageItem[] = [
  { id: "hindi", name: "Hindi", nativeName: "हिन्दी", count: 12 },
  { id: "english", name: "English", nativeName: "English", count: 10 },
  { id: "gujarati", name: "Gujarati", nativeName: "ગુજરાતી", count: 6 },
  { id: "tamil", name: "Tamil", nativeName: "தமிழ்", count: 4 },
  { id: "telugu", name: "Telugu", nativeName: "తెలుగు", count: 5 },
  { id: "malayalam", name: "Malayalam", nativeName: "മലയാളം", count: 3 },
  { id: "kannada", name: "Kannada", nativeName: "ಕನ್ನಡ", count: 3 },
  { id: "marathi", name: "Marathi", nativeName: "मराठी", count: 2 },
  { id: "bengali", name: "Bengali", nativeName: "বাংলা", count: 2 },
];
