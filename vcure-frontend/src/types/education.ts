export type EducationCategory = "Nutrition" | "Lifestyle" | "Medical" | "Preventive Health";
export type ArticleDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface ArticleSection {
  heading: string;
  body: string;
}

export interface ArticleSummary {
  id: string;
  title: string;
  category: EducationCategory;
  topic: string;
  imageQuery: string;
  readingTimeMinutes: number;
  difficulty: ArticleDifficulty;
  excerpt: string;
  isBookmarked: boolean;
  isPersonalized: boolean;
}

export interface ArticleDetail extends ArticleSummary {
  sections: ArticleSection[];
  relatedArticleIds: string[];
}

export interface ContentProgress {
  articleId: string;
  percentRead: number;
  lastViewedAt: string;
}

export interface ArticleFilters {
  category?: EducationCategory;
  difficulty?: ArticleDifficulty;
  query?: string;
}
