import {
  Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query,
} from '@nestjs/common';
import { EducationService } from './education.service';
import { ArticleFiltersDto, CategoryQueryDto, UpdateProgressDto } from './dto/education.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/auth-tokens.type';
import {
  ArticleDetailResponse, ArticleSummaryResponse, ContentProgressResponse,
} from './types/education.type';

/**
 * Education surface for ACC1's EducationAdapter — 12 of its 14 operations.
 *
 * `getRecommendedArticles` and `getPersonalizedArticles` are intentionally
 * absent: no authoritative ranking or personalisation contract exists, and no
 * ACC3 source is available. See EDUCATION-BLOCKED.
 *
 * Literal routes are declared before `:articleId` so they are never shadowed.
 */
@Controller('education')
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  @Get('categories')
  getCategories(): string[] {
    return this.educationService.getCategories();
  }

  @Get('topics')
  getTopics(@Query() dto: CategoryQueryDto): Promise<string[]> {
    return this.educationService.getTopics(dto.category);
  }

  @Get('articles')
  searchArticles(
    @CurrentUser() user: AuthenticatedUser,
    @Query() filters: ArticleFiltersDto,
  ): Promise<ArticleSummaryResponse[]> {
    return this.educationService.searchArticles(user.id, filters);
  }

  @Get('bookmarks')
  getBookmarked(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ArticleSummaryResponse[]> {
    return this.educationService.getBookmarkedArticles(user.id);
  }

  @Get('recently-viewed')
  getRecentlyViewed(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ArticleSummaryResponse[]> {
    return this.educationService.getRecentlyViewed(user.id);
  }

  @Get('articles/:articleId')
  getDetail(
    @CurrentUser() user: AuthenticatedUser,
    @Param('articleId', ParseUUIDPipe) articleId: string,
  ): Promise<ArticleDetailResponse> {
    return this.educationService.getArticleDetail(user.id, articleId);
  }

  @Get('articles/:articleId/related')
  getRelated(
    @CurrentUser() user: AuthenticatedUser,
    @Param('articleId', ParseUUIDPipe) articleId: string,
  ): Promise<ArticleSummaryResponse[]> {
    return this.educationService.getRelatedArticles(user.id, articleId);
  }

  @Post('articles/:articleId/bookmark')
  toggleBookmark(
    @CurrentUser() user: AuthenticatedUser,
    @Param('articleId', ParseUUIDPipe) articleId: string,
  ): Promise<{ isBookmarked: boolean }> {
    return this.educationService.toggleBookmark(user.id, articleId);
  }

  @Post('articles/:articleId/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  async recordView(
    @CurrentUser() user: AuthenticatedUser,
    @Param('articleId', ParseUUIDPipe) articleId: string,
  ): Promise<void> {
    await this.educationService.recordView(user.id, articleId);
  }

  @Get('articles/:articleId/progress')
  getProgress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('articleId', ParseUUIDPipe) articleId: string,
  ): Promise<ContentProgressResponse | null> {
    return this.educationService.getProgress(user.id, articleId);
  }

  @Put('articles/:articleId/progress')
  updateProgress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('articleId', ParseUUIDPipe) articleId: string,
    @Body() dto: UpdateProgressDto,
  ): Promise<ContentProgressResponse> {
    return this.educationService.updateProgress(user.id, articleId, dto);
  }
}
