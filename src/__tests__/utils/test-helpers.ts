import { Request, Response } from 'express';

// Extend Request type to include user property
interface RequestWithUser extends Request {
  user?: {
    id: string;
    username?: string;
    roles?: string[];
  };
}

/**
 * Mock Express Request
 */
export const mockRequest = (data: Partial<RequestWithUser> = {}): Partial<RequestWithUser> => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    ip: '127.0.0.1',
    user: undefined,
    ...data,
  } as Partial<RequestWithUser>;
};

/**
 * Mock Express Response
 */
export const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  };
  return res;
};

/**
 * Mock Prisma Client for User Service
 */
export const mockPrismaClient: any = {
  userProfile: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn((callback: (prisma: unknown) => Promise<unknown>) =>
    callback ? callback(mockPrismaClient) : Promise.resolve([])
  ),
};

/**
 * Mock User Profile Data
 */
export const mockUserProfile = {
  id: 'profile-123',
  userId: 'user-123',
  username: 'testuser',
  email: 'test@example.com',
  name: 'Test User',
  nip: '123456789',
  phone: '08123456789',
  avatar: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

/**
 * Reset All Mocks
 */
export const resetAllMocks = () => {
  Object.values(mockPrismaClient).forEach((model) => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach((method) => {
        if (method && typeof (method as jest.Mock).mockReset === 'function') {
          (method as jest.Mock).mockReset();
        }
      });
    }
  });
};
