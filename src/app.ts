import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import postRoutes from './routes/postRoutes';
import commentRoutes from './routes/commentRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { setupSwagger } from './config/swagger';

dotenv.config();

const app = express();
app.use(express.json());

setupSwagger(app);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// Error handler middleware
app.use(errorHandler);

connectDB();

export default app;
