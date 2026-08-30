import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaTx } from './prisma-tx.type';

/**
 * Shared plumbing for repositories: resolves the execution context and owns
 * the only `$transaction` entry point in the application.
 *
 * Repositories are the ONLY classes permitted to reference PrismaService.
 */
@Injectable()
export abstract class BaseRepository {
  constructor(protected readonly prisma: PrismaService) {}

  /** Returns the supplied transaction client, or the root client. */
  protected db(tx?: PrismaTx): PrismaTx {
    return tx ?? this.prisma;
  }

  /**
   * Runs `fn` inside an interactive transaction and hands back a PrismaTx that
   * callers pass to other repository methods. Services use this instead of
   * touching PrismaService.
   */
  runInTransaction<T>(fn: (tx: PrismaTx) => Promise<T>): Promise<T> {
    return this.prisma.$transaction((tx) => fn(tx));
  }
}
