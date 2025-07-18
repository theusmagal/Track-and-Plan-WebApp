import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import registerRouter from './routes/register.route';
import boardRouter from './routes/board.route';
import columnRouter from './routes/column.route';
import cardRouter from './routes/card.route';
import commentRouter from './routes/comment.route';

dotenv.config();

const app = express();

// ✅ CORS configuration allowing Vercel + local dev

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());

// ✅ Route handlers
app.use('/api/auth', registerRouter);
app.use('/api/boards', boardRouter);
app.use('/api/columns', columnRouter);
app.use('/api/cards', cardRouter);
app.use('/api/comments', commentRouter);

// ✅ Export app to use with Railway deployment
export default app;
