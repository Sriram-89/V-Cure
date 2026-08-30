import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * A Prisma execution context: either the root client or an interactive
 * transaction client.
 *
 * Every repository method accepts an optional `tx`. This is what lets
 * OnboardingService compose repositories inside one transaction instead of
 * bypassing them with raw `tx.*` calls, while keeping the single access path
 * required by 03 §62 and RULE-073/074:
 *
 *   Controller -> Service -> Repository -> Prisma
 */
export type PrismaTx = PrismaService | Prisma.TransactionClient;
