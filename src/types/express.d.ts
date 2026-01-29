import { IUserPayload } from './user';

declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload;
    }
  }
}
