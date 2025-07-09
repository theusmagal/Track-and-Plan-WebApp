import express from 'express';
import cors from 'cors';
import registerRouter from './routes/register.route'; // ✅ matches file name
import boardRouter from './routes/board.route';
import columnRouter from './routes/column.route';
import cardRouter from './routes/card.route';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', registerRouter); 
app.use('/api/boards', boardRouter);
app.use('/api/columns', columnRouter);
app.use('/api/cards', cardRouter);



app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});
