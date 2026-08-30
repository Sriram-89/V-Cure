import { UsersRepository } from './users.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('UsersRepository (delegation)', () => {
  let prisma: any;
  let repo: UsersRepository;

  beforeEach(() => {
    prisma = {
      userProfile: {
        findFirst: jest.fn().mockResolvedValue({ id: 'up_1' }),
        create: jest.fn().mockResolvedValue({ id: 'up_1' }),
        update: jest.fn().mockResolvedValue({ id: 'up_1' }),
      },
      userProfileHistory: { create: jest.fn(), findMany: jest.fn().mockResolvedValue([]) },
      $transaction: jest.fn(),
    };
    repo = new UsersRepository(prisma as unknown as PrismaService);
  });

  it('scopes findActiveProfile to the user and excludes soft-deleted rows', async () => {
    await repo.findActiveProfile('user_1');
    expect(prisma.userProfile.findFirst).toHaveBeenCalledWith({
      where: { userId: 'user_1', deletedAt: null },
      include: { user: { select: { email: true } } },
    });
  });

  it('routes writes through the transaction client when one is given', async () => {
    const tx: any = { userProfile: { update: jest.fn().mockResolvedValue({}) } };
    await repo.updateProfile('up_1', { region: 'AP' }, tx);
    expect(tx.userProfile.update).toHaveBeenCalled();
    expect(prisma.userProfile.update).not.toHaveBeenCalled();
  });

  it('soft-deletes rather than hard-deleting', async () => {
    await repo.softDeleteProfile('up_1');
    const arg = prisma.userProfile.update.mock.calls[0][0];
    expect(arg.data.deletedAt).toBeInstanceOf(Date);
  });
});
