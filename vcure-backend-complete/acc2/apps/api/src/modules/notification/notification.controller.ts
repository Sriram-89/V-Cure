import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/auth-tokens.type';
import { NotificationResponse } from './types/notification.type';

/** APIs 59-61. Routes match ACC1's notification adapter exactly. */
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /** API 59 — GET /api/v1/notifications */
  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NotificationResponse[]> {
    return this.notificationService.listMine(user.id);
  }

  /** API 60 — PUT /api/v1/notifications/{id}/read */
  @Put(':id/read')
  async markAsRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NotificationResponse> {
    return this.notificationService.markAsRead(user.id, id);
  }

  /** API 61 — DELETE /api/v1/notifications/{id} */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.notificationService.remove(user.id, id);
  }
}
