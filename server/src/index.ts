import express from 'express';
import cors from 'cors';
import registerRouter from './routes/register.route'; 
import boardRouter from './routes/board.route';
import columnRouter from './routes/column.route';
import cardRouter from './routes/card.route';
import commentRouter from './routes/comment.route';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', registerRouter); 
app.use('/api/boards', boardRouter);
app.use('/api/columns', columnRouter);
app.use('/api/cards', cardRouter);
app.use('/api/comments', commentRouter);

// ✅ Use environment port or default to 3001
const PORT = Number (process.env.PORT) || 3001;

// ✅ Bind to 0.0.0.0 for Railway
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
