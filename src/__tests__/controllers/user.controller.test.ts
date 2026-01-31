import {
  getUsers,
  getUserById,
  createUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from '../../controllers/user.controller';
import { mockRequest, mockResponse, mockUserProfile, resetAllMocks } from '../utils/test-helpers';
import * as userService from '../../services/user.service';

jest.mock('../../services/user.service');

describe('User Controller', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    resetAllMocks();
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return paginated list of users', async () => {
      const mockUsers = [mockUserProfile, { ...mockUserProfile, id: 'profile-456' }];

      req.query = { page: '1', limit: '25' };

      (userService.findAll as jest.Mock).mockResolvedValue({
        items: mockUsers,
        total: 2,
      });

      await getUsers(req, res);

      expect(userService.findAll).toHaveBeenCalledWith(0, 25, undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            items: mockUsers,
            pagination: expect.any(Object),
          }),
        })
      );
    });

    it('should handle search parameter', async () => {
      req.query = { search: 'test' };

      (userService.findAll as jest.Mock).mockResolvedValue({
        items: [mockUserProfile],
        total: 1,
      });

      await getUsers(req, res);

      expect(userService.findAll).toHaveBeenCalledWith(0, 25, 'test');
    });

    it('should use default pagination if not provided', async () => {
      req.query = {};

      (userService.findAll as jest.Mock).mockResolvedValue({
        items: [],
        total: 0,
      });

      await getUsers(req, res);

      expect(userService.findAll).toHaveBeenCalledWith(0, 25, undefined);
    });
  });

  describe('getUserById', () => {
    it('should return user profile by ID', async () => {
      req.params = { id: 'profile-123' };

      (userService.findById as jest.Mock).mockResolvedValue(mockUserProfile);

      await getUserById(req, res);

      expect(userService.findById).toHaveBeenCalledWith('profile-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockUserProfile,
        })
      );
    });

    it('should return 404 if user not found', async () => {
      req.params = { id: 'nonexistent' };

      (userService.findById as jest.Mock).mockResolvedValue(null);

      await getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'User profile not found',
        })
      );
    });
  });

  describe('createUserProfile', () => {
    it('should create new user profile', async () => {
      const newProfileData = {
        userId: '123e4567-e89b-12d3-a456-426614174000', // Valid UUID
        username: 'newuser',
        email: 'new@example.com',
        name: 'New User',
      };
      req.body = newProfileData;
      req.user = { id: 'admin-123' };

      (userService.create as jest.Mock).mockResolvedValue({
        id: 'profile-new',
        ...newProfileData,
      });

      await createUserProfile(req, res);

      expect(userService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...newProfileData,
          createdBy: 'admin-123',
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return 400 on validation error', async () => {
      req.body = { username: '' }; // Invalid data

      await createUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should use SYSTEM as createdBy if user not provided', async () => {
      req.body = {
        userId: '123e4567-e89b-12d3-a456-426614174000', // Valid UUID
        username: 'newuser',
        email: 'new@example.com',
        name: 'New User',
      };
      req.user = undefined;

      (userService.create as jest.Mock).mockResolvedValue({});

      await createUserProfile(req, res);

      expect(userService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          createdBy: 'SYSTEM',
        })
      );
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile', async () => {
      const updateData = { name: 'Updated Name' };

      req.params = { id: 'profile-123' };
      req.body = updateData;
      req.user = { id: 'admin-123' };

      (userService.update as jest.Mock).mockResolvedValue({
        ...mockUserProfile,
        ...updateData,
      });

      await updateUserProfile(req, res);

      expect(userService.update).toHaveBeenCalledWith(
        'profile-123',
        expect.objectContaining({
          ...updateData,
          updatedBy: 'admin-123',
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if profile not found', async () => {
      req.params = { id: 'nonexistent' };
      req.body = { name: 'Test' };

      const error = new Error('Not found') as Error & { code?: string };
      error.code = 'P2025';
      (userService.update as jest.Mock).mockRejectedValue(error);

      await updateUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 on validation error', async () => {
      req.params = { id: 'profile-123' };
      req.body = { email: 'invalid-email' }; // Invalid format

      await updateUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('deleteUserProfile', () => {
    it('should soft delete user profile', async () => {
      req.params = { id: 'profile-123' };
      req.user = { id: 'admin-123' };

      (userService.softDelete as jest.Mock).mockResolvedValue(undefined);

      await deleteUserProfile(req, res);

      expect(userService.softDelete).toHaveBeenCalledWith('profile-123', 'admin-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'User profile deleted successfully',
        })
      );
    });

    it('should return 404 if profile not found', async () => {
      req.params = { id: 'nonexistent' };

      const error = new Error('Not found') as Error & { code?: string };
      error.code = 'P2025';
      (userService.softDelete as jest.Mock).mockRejectedValue(error);

      await deleteUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
