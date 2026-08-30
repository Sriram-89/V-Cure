import { BaseRepository } from './base.repository';
import { PrismaService } from '../prisma/prisma.service';

class TestRepository extends BaseRepository {
  exposeDb(tx?: any) {
    return this.db(tx);
  }
}

describe('BaseRepository (PrismaTx resolution)', () => {
  let prisma: any;
  let repo: TestRepository;

  beforeEach(() => {
    prisma = { $transaction: jest.fn(async (fn: any) => fn('TX_CLIENT')) };
    repo = new TestRepository(prisma as unknown as PrismaService);
  });

  it('uses the root client when no transaction is supplied', () => {
    expect(repo.exposeDb()).toBe(prisma);
  });

  it('uses the supplied transaction client when one is passed', () => {
    const tx = { marker: true };
    expect(repo.exposeDb(tx)).toBe(tx);
  });

  it('runInTransaction hands the tx client to the callback', async () => {
    const received: unknown[] = [];
    const result = await repo.runInTransaction(async (tx) => {
      received.push(tx);
      return 'done';
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(received).toEqual(['TX_CLIENT']);
    expect(result).toBe('done');
  });
});
