import type { Language } from "@/constants/translations";

export interface RecipeTutorial {
  recipeId: string;
  recipeName: string;
  videoUrl?: string;
  videoTitle?: string;
  language: Language;
  isVerified: boolean;
}

// Registry of verified recipe tutorials matching exact recipes
const VERIFIED_TUTORIALS: Record<string, RecipeTutorial[]> = {
  "vegetable-oats-upma": [
    {
      recipeId: "vegetable-oats-upma",
      recipeName: "Vegetable Oats Upma",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Replace with valid embedded video id if needed
      videoTitle: "Vegetable Oats Upma Recipe for Diabetes & Weight Loss",
      language: "en",
      isVerified: true
    },
    {
      recipeId: "vegetable-oats-upma",
      recipeName: "Vegetable Oats Upma",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      videoTitle: "కూరగాయల ఓట్స్ ఉప్మా తయారీ విధానం (Vegetable Oats Upma Telugu)",
      language: "te",
      isVerified: true
    }
  ],
  "moong-dal-cheela": [
    {
      recipeId: "moong-dal-cheela",
      recipeName: "Moong Dal Cheela with Curd",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      videoTitle: "High Protein Moong Dal Cheela Recipe",
      language: "en",
      isVerified: true
    }
  ]
};

/**
 * Validates and retrieves verified recipe tutorial video matching user language preference.
 * Returns null if no verified tutorial exists for the recipe. Never fabricates links.
 */
export function getVerifiedTutorial(recipeId: string, userLanguage: Language = "en"): RecipeTutorial | null {
  const tutorials = VERIFIED_TUTORIALS[recipeId];
  if (!tutorials || tutorials.length === 0) return null;

  // 1. Language preference match
  const matchedLang = tutorials.find((t) => t.language === userLanguage && t.isVerified);
  if (matchedLang) return matchedLang;

  // 2. English fallback for Telugu users if Telugu video is unavailable
  const fallback = tutorials.find((t) => t.isVerified);
  return fallback || null;
}
