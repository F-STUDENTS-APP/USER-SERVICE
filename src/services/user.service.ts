import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';

export const findAll = async (offset: number, limit: number, search?: string) => {
  const where: Prisma.UserProfileWhereInput = {
    deletedAt: null,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { nip: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.userProfile.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    prisma.userProfile.count({ where }),
  ]);

  return { items, total };
};

export const findById = async (id: string) => {
  return prisma.userProfile.findUnique({
    where: { userId: id },
  });
};

export const create = async (data: Prisma.UserProfileCreateInput) => {
  return prisma.userProfile.create({ data });
};

export const update = async (id: string, data: Prisma.UserProfileUpdateInput) => {
  return prisma.userProfile.update({
    where: { userId: id },
    data,
  });
};

export const softDelete = async (id: string, deletedBy: string) => {
  return prisma.userProfile.update({
    where: { userId: id },
    data: {
      deletedAt: new Date(),
      isActive: false,
      deletedBy,
    },
  });
};
