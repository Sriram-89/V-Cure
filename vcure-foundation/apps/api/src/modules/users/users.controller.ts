import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/auth-tokens.type';
import {
  UserProfileHistoryEntry,
  UserProfileResponse,
} from './types/user-profile.type';

@Controller('users/me/profile')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getMyProfile(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserProfileResponse> {
    return this.usersService.getMyProfile(user.id);
  }

  @Put()
  async upsertMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateUserProfileDto,
  ): Promise<UserProfileResponse> {
    return this.usersService.upsertMyProfile(user.id, dto);
  }

  @Get('history')
  async getMyProfileHistory(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserProfileHistoryEntry[]> {
    return this.usersService.getProfileHistory(user.id);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMyProfile(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.usersService.softDeleteMyProfile(user.id);
  }
}
