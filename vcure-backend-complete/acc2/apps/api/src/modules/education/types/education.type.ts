import { ArticleDifficulty } from '@prisma/client';

/**
 * ACC1 `EducationCategory` — a closed four-value union. Sourced from the
 * consumer contract, not invented.
 */
export const EDUCATION_CATEGORIES = [
  'Nutrition',
  'Lifestyle',
  'Medical',
  'Preventive Health',
] as const;

export type EducationCategory = (typeof EDUCATION_CATEGORIES)[number];

/** ACC1 `ArticleSection`. */
export interface ArticleSectionResponse {
  heading: string;
  body: string;
}

/** ACC1 `ArticleSummary`. */
export interface ArticleSummaryResponse {
  id: string;
  title: string;
  category: string;
  topic: string;
  imageQuery: string;
  readingTimeMinutes: number;
  difficulty: ArticleDifficulty;
  excerpt: string;
  isBookmarked: boolean;
  isPersonalized: boolean;
}

/** ACC1 `ArticleDetail`. */
export interface ArticleDetailResponse extends ArticleSummaryResponse {
  sections: ArticleSectionResponse[];
  relatedArticleIds: string[];
}

/** ACC1 `ContentProgress`. */
export interface ContentProgressResponse {
  articleId: string;
  percentRead: number;
  lastViewedAt: Date;
}
