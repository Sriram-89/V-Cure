import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MedicalHistoryService } from './medical-history.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('MedicalHistoryService', () => {
  let service: MedicalHistoryService;
  let prisma: any;

  const userId = 'user_1';

  beforeEach(async () => {
    prisma = {
      medicalCondition: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      medicine: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      allergy: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      familyHistoryEntry: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalHistoryService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(MedicalHistoryService);
  });

  describe('medical conditions', () => {
    it('lists only non-deleted conditions for the user', async () => {
      prisma.medicalCondition.findMany.mockResolvedValueOnce([]);
      await service.listConditions(userId);
      expect(prisma.medicalCondition.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId, deletedAt: null },
        }),
      );
    });

    it('creates a condition defaulting isActive to true', async () => {
      prisma.medicalCondition.create.mockResolvedValueOnce({
        id: 'c1',
        name: 'Type 2 Diabetes',
        diagnosedAt: null,
        isActive: true,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createCondition(userId, {
        name: 'Type 2 Diabetes',
      });

      expect(prisma.medicalCondition.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId, isActive: true }),
        }),
      );
      expect(result.name).toBe('Type 2 Diabetes');
    });

    it('throws NotFoundException when updating a condition not owned by the user', async () => {
      prisma.medicalCondition.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.updateCondition(userId, 'not_mine', { name: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('soft-deletes a condition by setting deletedAt', async () => {
      prisma.medicalCondition.findFirst.mockResolvedValueOnce({
        id: 'c1',
        userId,
        name: 'Hypertension',
        diagnosedAt: null,
        isActive: true,
        notes: null,
      });
      prisma.medicalCondition.update.mockResolvedValueOnce({});

      await service.deleteCondition(userId, 'c1');

      expect(prisma.medicalCondition.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'c1' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
    });
  });

  describe('medicines', () => {
    it('creates a medicine defaulting isActive to true', async () => {
      prisma.medicine.create.mockResolvedValueOnce({
        id: 'm1',
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'twice daily',
        prescribedFor: 'Type 2 Diabetes',
        startedAt: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createMedicine(userId, {
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'twice daily',
        prescribedFor: 'Type 2 Diabetes',
      });

      expect(result.dosage).toBe('500mg');
    });

    it('throws NotFoundException when deleting a medicine not owned by the user', async () => {
      prisma.medicine.findFirst.mockResolvedValueOnce(null);
      await expect(service.deleteMedicine(userId, 'not_mine')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('preserves existing fields on partial update', async () => {
      prisma.medicine.findFirst.mockResolvedValueOnce({
        id: 'm1',
        userId,
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'twice daily',
        prescribedFor: 'Type 2 Diabetes',
        startedAt: null,
        isActive: true,
      });
      prisma.medicine.update.mockResolvedValueOnce({
        id: 'm1',
        name: 'Metformin',
        dosage: '1000mg',
        frequency: 'twice daily',
        prescribedFor: 'Type 2 Diabetes',
        startedAt: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.updateMedicine(userId, 'm1', { dosage: '1000mg' });

      expect(prisma.medicine.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            dosage: '1000mg',
            frequency: 'twice daily', // preserved
          }),
        }),
      );
    });
  });

  describe('allergies', () => {
    it('creates an allergy with a custom free-text allergen and default severity', async () => {
      prisma.allergy.create.mockResolvedValueOnce({
        id: 'a1',
        allergen: 'shellfish',
        severity: 'MODERATE',
        reaction: 'hives',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createAllergy(userId, {
        allergen: 'shellfish',
        reaction: 'hives',
      });

      expect(prisma.allergy.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ severity: 'MODERATE' }),
        }),
      );
      expect(result.allergen).toBe('shellfish');
    });

    it('throws NotFoundException when updating an allergy not owned by the user', async () => {
      prisma.allergy.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.updateAllergy(userId, 'not_mine', { allergen: 'peanuts' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('family history', () => {
    it('creates a family history entry', async () => {
      prisma.familyHistoryEntry.create.mockResolvedValueOnce({
        id: 'f1',
        relation: 'father',
        condition: 'Hypertension',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createFamilyHistory(userId, {
        relation: 'father',
        condition: 'Hypertension',
      });

      expect(result.relation).toBe('father');
    });

    it('throws NotFoundException when deleting an entry not owned by the user', async () => {
      prisma.familyHistoryEntry.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.deleteFamilyHistory(userId, 'not_mine'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
