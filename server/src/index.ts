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

// ✅ CORS configuration allowing Vercel and localhost frontend
const allowedOrigins = [
  'https://track-and-plan-web-app.vercel.app',
  'https://track-and-plan-web-app-2i5x.vercel.app',
  'http://localhost:5173',
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));


app.use(express.json());

// Routes
app.use('/api/auth', registerRouter);
app.use('/api/boards', boardRouter);
app.use('/api/columns', columnRouter);
app.use('/api/cards', cardRouter);
app.use('/api/comments', commentRouter);

// ✅ Use environment port or fallback to 3001
const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
