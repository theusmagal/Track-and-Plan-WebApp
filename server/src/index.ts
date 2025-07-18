import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import registerRouter from './routes/register.route';
import boardRouter from './routes/board.route';
import columnRouter from './routes/column.route';
import cardRouter from './routes/card.route';
import commentRouter from './routes/comment.route';

dotenv.config();

const app = express();
app.set('trust proxy', true); // Add this line for Railway/Vercel

app.use(cors({
  origin: ['https://track-and-plan-web-app.vercel.app'],
  credentials: true,
}));

app.use(express.json());

// API routes
app.use('/api/auth', registerRouter);
app.use('/api/boards', boardRouter);
app.use('/api/columns', columnRouter);
app.use('/api/cards', cardRouter);
app.use('/api/comments', commentRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;
