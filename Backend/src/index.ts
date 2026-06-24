import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './DB/connection.js';
import indexRouter from './Modules/index.routes.js';
import { seedDatabaseIfEmpty } from './seedDatabase.js';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app: Application = express();

interface AppError extends Error {
  statusCode?: number;
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));


app.set('trust proxy', 1);

const limiter = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  message: "Too much requests try again later",
  standardHeaders: "draft-7" as const,
  legacyHeaders: false,
  validate: { trustProxy: false }
};

app.use(rateLimit(limiter));
app.use(helmet());
app.use(morgan('dev'));



app.use('/uploads', express.static('uploads'));

app.use('/', indexRouter);

app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

connectDB()

export default app;

// const startServer = async (): Promise<void> => {
//   try {
//     await connectDB();
//     await seedDatabaseIfEmpty();

//     app.listen(PORT, () => {
//       console.log(`Server is running on port ${PORT}`);
//       console.log(`http://localhost:${PORT}`);
//     });
//   } catch (error) {
//     console.error('Server startup failed:', error);
//     process.exit(1);
//   }
// };

// startServer();
