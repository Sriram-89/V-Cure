import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import {
  UpdateLanguageSettingsDto,
  UpdateNotificationPreferencesDto,
  UpdatePrivacyConsentDto,
  UpdateUnitsPreferenceDto,
} from './dto/update-settings.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/auth-tokens.type';
import {
  LanguageSettingsResponse,
  NotificationPreferencesResponse,
  PrivacyConsentResponse,
  UnitsPreferenceResponse,
} from './types/settings.type';

/**
 * Settings surface for ACC1's SettingsAdapter.
 *
 * Two adapter operations are NOT exposed and are intentionally blocked —
 * `getDeviceSessions` and `logoutAllOtherSessions`. See SETTINGS-BLOCKED in
 * the report: the fields and the current-session identity they need are not
 * defined by any authoritative source.
 */
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('language')
  getLanguage(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<LanguageSettingsResponse> {
    return this.settingsService.getLanguageSettings(user.id);
  }

  @Put('language')
  updateLanguage(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateLanguageSettingsDto,
  ): Promise<LanguageSettingsResponse> {
    return this.settingsService.updateLanguageSettings(user.id, dto);
  }

  @Get('units')
  getUnits(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UnitsPreferenceResponse> {
    return this.settingsService.getUnitsPreference(user.id);
  }

  @Put('units')
  updateUnits(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateUnitsPreferenceDto,
  ): Promise<UnitsPreferenceResponse> {
    return this.settingsService.updateUnitsPreference(user.id, dto);
  }

  @Get('notifications')
  getNotifications(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NotificationPreferencesResponse> {
    return this.settingsService.getNotificationPreferences(user.id);
  }

  @Put('notifications')
  updateNotifications(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferencesResponse> {
    return this.settingsService.updateNotificationPreferences(user.id, dto);
  }

  @Get('privacy')
  getPrivacy(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PrivacyConsentResponse> {
    return this.settingsService.getPrivacyConsent(user.id);
  }

  @Put('privacy')
  updatePrivacy(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePrivacyConsentDto,
  ): Promise<PrivacyConsentResponse> {
    return this.settingsService.updatePrivacyConsent(user.id, dto);
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logoutSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.settingsService.logoutSession(user.id, id);
  }
}
