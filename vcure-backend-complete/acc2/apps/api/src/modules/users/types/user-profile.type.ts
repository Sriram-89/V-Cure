import { Gender } from '@prisma/client';

export interface UserProfileResponse {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  dateOfBirth: Date;
  gender: Gender;
  /** API field name per ACC1; sourced from UserProfile.phoneNumber. */
  phone: string | null;
  region: string | null;
  city: string | null;
  country: string | null;
  language: string;
  avatarUrl: string | null;
  age: number;
  createdAt: Date;
  updatedAt: Date;
}

