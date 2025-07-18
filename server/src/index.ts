import express from 'express';
import cors from 'cors';
import registerRouter from './routes/register.route';
import boardRouter from './routes/board.route';
import columnRouter from './routes/column.route';
import cardRouter from './routes/card.route';
import commentRouter from './routes/comment.route';

const app = express();

// ✅ Explicitly allow Vercel frontend origin
app.use(cors({
  origin: 'https://track-and-plan-web-app.vercel.app',
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', registerRouter);
app.use('/api/boards', boardRouter);
app.use('/api/columns', columnRouter);
app.use('/api/cards', cardRouter);
app.use('/api/comments', commentRouter);

// ✅ Use PORT from Railway
const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
