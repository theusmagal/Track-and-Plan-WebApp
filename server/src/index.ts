import express from 'express';
import dotenv from 'dotenv';
// import cors from 'cors'; ❌ (You said no CORS)

import registerRouter from './routes/register.route';
import boardRouter from './routes/board.route';
import columnRouter from './routes/column.route';
import cardRouter from './routes/card.route';
import commentRouter from './routes/comment.route';

// Load environment variables from .env
dotenv.config();

const app = express();

app.use(express.json());

// Register all routes
app.use('/api/auth', registerRouter);
app.use('/api/boards', boardRouter);
app.use('/api/columns', columnRouter);
app.use('/api/cards', cardRouter);
app.use('/api/comments', commentRouter);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
