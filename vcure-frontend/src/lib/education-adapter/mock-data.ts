import type { ArticleDetail } from "@/types/education";

export const MOCK_ARTICLES: ArticleDetail[] = [
  {
    id: "article-glycemic-index",
    title: "Understanding the Glycemic Index",
    category: "Nutrition",
    topic: "Blood sugar",
    imageQuery: "blood sugar food chart",
    readingTimeMinutes: 6,
    difficulty: "BEGINNER",
    excerpt: "How different carbs affect your blood sugar, and why it matters for your plan.",
    isBookmarked: false,
    isPersonalized: true,
    sections: [
      {
        heading: "What the glycemic index measures",
        body: "The glycemic index ranks carbohydrate-containing foods by how quickly they raise blood sugar compared to pure glucose. Lower-GI foods release sugar more slowly, which generally means steadier energy and fewer spikes."
      },
      {
        heading: "Why it matters for your plan",
        body: "If you're managing a condition like diabetes or insulin resistance, favoring lower-GI foods can help keep blood sugar more stable across the day, which is part of why some of your recommended meals lean on whole grains and legumes."
      },
      {
        heading: "Practical takeaways",
        body: "Pairing higher-GI foods with protein or fiber — like fruit with nuts, or rice with lentils — slows the overall glycemic response of the meal."
      }
    ],
    relatedArticleIds: ["article-fiber-basics", "article-portion-control"]
  },
  {
    id: "article-fiber-basics",
    title: "Fiber Basics: Why It's Not Just for Digestion",
    category: "Nutrition",
    topic: "Macronutrients",
    imageQuery: "high fiber foods vegetables grains",
    readingTimeMinutes: 5,
    difficulty: "BEGINNER",
    excerpt: "Fiber does more than keep things moving — here's what it actually does in your body.",
    isBookmarked: true,
    isPersonalized: false,
    sections: [
      {
        heading: "Two types of fiber",
        body: "Soluble fiber dissolves in water and can help lower cholesterol and steady blood sugar. Insoluble fiber adds bulk and supports regular digestion. Most whole foods contain a mix of both."
      },
      {
        heading: "Beyond digestion",
        body: "Fiber feeds the bacteria in your gut microbiome, which is increasingly linked to immune function and even mood regulation."
      }
    ],
    relatedArticleIds: ["article-glycemic-index"]
  },
  {
    id: "article-portion-control",
    title: "Portion Control Without Counting Every Gram",
    category: "Nutrition",
    topic: "Habits",
    imageQuery: "portion control plate meal",
    readingTimeMinutes: 4,
    difficulty: "BEGINNER",
    excerpt: "Simple visual cues that make portion sizing intuitive instead of exhausting.",
    isBookmarked: false,
    isPersonalized: false,
    sections: [
      {
        heading: "The hand-portion method",
        body: "A palm-sized portion of protein, a fist of vegetables, and a cupped-hand of carbs is a reasonable starting point for most adults."
      }
    ],
    relatedArticleIds: ["article-glycemic-index"]
  },
  {
    id: "article-sleep-and-weight",
    title: "How Sleep Affects Weight Management",
    category: "Lifestyle",
    topic: "Sleep",
    imageQuery: "person sleeping bedroom night",
    readingTimeMinutes: 7,
    difficulty: "INTERMEDIATE",
    excerpt: "Poor sleep changes the hormones that regulate hunger — here's the mechanism.",
    isBookmarked: false,
    isPersonalized: true,
    sections: [
      {
        heading: "Ghrelin and leptin",
        body: "Sleep deprivation raises ghrelin (which signals hunger) and lowers leptin (which signals fullness), making it harder to regulate appetite the next day."
      },
      {
        heading: "What this means practically",
        body: "Consistent sleep — even more than sleep duration alone — tends to correlate with steadier eating patterns and better adherence to nutrition goals."
      }
    ],
    relatedArticleIds: ["article-stress-and-cortisol"]
  },
  {
    id: "article-stress-and-cortisol",
    title: "Stress, Cortisol, and Your Metabolism",
    category: "Lifestyle",
    topic: "Stress",
    imageQuery: "stress relaxation meditation",
    readingTimeMinutes: 6,
    difficulty: "INTERMEDIATE",
    excerpt: "Chronic stress does more than feel bad — it changes how your body stores energy.",
    isBookmarked: false,
    isPersonalized: false,
    sections: [
      {
        heading: "The cortisol response",
        body: "Cortisol is useful in short bursts, but chronically elevated levels are associated with increased abdominal fat storage and cravings for high-calorie foods."
      }
    ],
    relatedArticleIds: ["article-sleep-and-weight"]
  },
  {
    id: "article-understanding-bloodwork",
    title: "Understanding Your Bloodwork Panel",
    category: "Medical",
    topic: "Lab results",
    imageQuery: "blood test lab report",
    readingTimeMinutes: 9,
    difficulty: "INTERMEDIATE",
    excerpt: "A plain-language walkthrough of the numbers on a standard metabolic panel.",
    isBookmarked: false,
    isPersonalized: true,
    sections: [
      {
        heading: "Fasting glucose",
        body: "This measures blood sugar after roughly 8 hours without food. It's one input doctors use to screen for prediabetes and diabetes, alongside HbA1c."
      },
      {
        heading: "Lipid panel",
        body: "LDL, HDL, and triglycerides give a picture of cardiovascular risk. Context matters — ratios and trends over time are often more informative than any single number."
      }
    ],
    relatedArticleIds: ["article-preventive-screenings"]
  },
  {
    id: "article-preventive-screenings",
    title: "Preventive Screenings Worth Knowing About",
    category: "Preventive Health",
    topic: "Screenings",
    imageQuery: "doctor checkup preventive care",
    readingTimeMinutes: 8,
    difficulty: "BEGINNER",
    excerpt: "Which routine screenings matter most, and roughly when to get them.",
    isBookmarked: false,
    isPersonalized: false,
    sections: [
      {
        heading: "Why preventive care works",
        body: "Catching risk factors before symptoms appear generally means simpler, less invasive treatment — and often better outcomes."
      },
      {
        heading: "A starting checklist",
        body: "Annual blood pressure checks, periodic lipid panels, and age-appropriate cancer screenings are common baseline recommendations — always confirmed with your own doctor."
      }
    ],
    relatedArticleIds: ["article-understanding-bloodwork"]
  },
  {
    id: "article-managing-medication",
    title: "Staying Consistent With Daily Medication",
    category: "Medical",
    topic: "Medication adherence",
    imageQuery: "pill organizer medication routine",
    readingTimeMinutes: 5,
    difficulty: "BEGINNER",
    excerpt: "Small routine changes that make it easier to stay consistent.",
    isBookmarked: false,
    isPersonalized: false,
    sections: [
      {
        heading: "Anchor it to an existing habit",
        body: "Pairing a medication with something you already do daily — like brushing your teeth — tends to be more durable than relying on willpower alone."
      }
    ],
    relatedArticleIds: []
  }
];
