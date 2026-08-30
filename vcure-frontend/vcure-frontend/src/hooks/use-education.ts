import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { educationService } from "@/services/education-service";
import type { ArticleFilters, EducationCategory } from "@/types/education";

export function useEducationCategories() {
  return useQuery({ queryKey: ["education", "categories"], queryFn: educationService.getCategories });
}

export function useRecommendedArticles() {
  return useQuery({ queryKey: ["education", "recommended"], queryFn: educationService.getRecommended });
}

export function usePersonalizedArticles() {
  return useQuery({ queryKey: ["education", "personalized"], queryFn: educationService.getPersonalized });
}

export function useArticlesByCategory(category: EducationCategory | null) {
  return useQuery({
    queryKey: ["education", "category", category],
    queryFn: () => educationService.getByCategory(category as EducationCategory),
    enabled: Boolean(category)
  });
}

export function useArticleSearch(filters: ArticleFilters) {
  return useQuery({
    queryKey: ["education", "search", filters],
    queryFn: () => educationService.search(filters)
  });
}

export function useArticleDetail(articleId: string) {
  return useQuery({
    queryKey: ["education", "detail", articleId],
    queryFn: () => educationService.getDetail(articleId)
  });
}

export function useRelatedArticles(articleId: string) {
  return useQuery({
    queryKey: ["education", "related", articleId],
    queryFn: () => educationService.getRelated(articleId)
  });
}

export function useBookmarkedArticles() {
  return useQuery({ queryKey: ["education", "bookmarked"], queryFn: educationService.getBookmarked });
}

export function useRecentlyViewedArticles() {
  return useQuery({ queryKey: ["education", "recent"], queryFn: educationService.getRecentlyViewed });
}

export function useArticleProgress(articleId: string) {
  return useQuery({
    queryKey: ["education", "progress", articleId],
    queryFn: () => educationService.getProgress(articleId)
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (articleId: string) => educationService.toggleBookmark(articleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["education"] })
  });
}

export function useRecordArticleView() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (articleId: string) => educationService.recordView(articleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["education", "recent"] })
  });
}

export function useUpdateArticleProgress(articleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (percentRead: number) => educationService.updateProgress(articleId, percentRead),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["education", "progress", articleId] })
  });
}
