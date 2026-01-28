import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import 'express-async-errors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import specs from './config/swagger.config';
import logger from './config/logger';
import { sendError } from './utils/response';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
import userRoutes from './routes/user.routes';

app.use('/api/v1/users', userRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', service: 'user-service' });
});

// Error handling
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.stack);
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  sendError(res, status, message);
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    logger.info(`User Service listening on port ${port}`);
  });
}

export default app;
