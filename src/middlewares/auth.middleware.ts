import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

/**
 * Middleware to simulate or validate authentication.
 * In a real microservice, this would validate a JWT from the Auth Service.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // For now, we expect 'x-user-id' header or similar from an API Gateway
  // OR a Bearer token that we can decode.
  const userId = req.headers['x-user-id'] as string;

  if (!userId && process.env.NODE_ENV === 'production') {
    return sendError(res, 401, 'Unauthorized: User ID is missing');
  }

  // Attach user to request
  (req as any).user = {
    id: userId || 'SYSTEM',
  };

  next();
};
