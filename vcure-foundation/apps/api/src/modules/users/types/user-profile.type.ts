import { Gender } from '@prisma/client';

export interface UserProfileResponse {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth: Date;
  gender: Gender;
  phoneNumber: string | null;
  region: string | null;
  city: string | null;
  country: string;
  language: string;
  avatarUrl: string | null;
  age: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfileHistoryEntry {
  id: string;
  fullName: string;
  dateOfBirth: Date;
  gender: Gender;
  phoneNumber: string | null;
  region: string | null;
  city: string | null;
  country: string;
  language: string;
  avatarUrl: string | null;
  recordedAt: Date;
}
