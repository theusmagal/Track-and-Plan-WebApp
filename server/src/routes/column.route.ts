import express from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const columnRouter = express.Router();

// ✅ Get all columns for a specific board, including cards
columnRouter.get('/:boardId', authMiddleware, (async (req, res) => {
  const boardId = Number(req.params.boardId);

  const columns = await prisma.column.findMany({
    where: {
      boardId,
      board: {
        userId: (req as AuthenticatedRequest).user!.userId,
      },
    },
    include: {
      cards: {
        orderBy: { order: 'asc' }, // Optional: sort cards within columns
      },
    },
    orderBy: {
      order: 'asc', // Sort columns
    },
  });

  res.json(columns);
}) as express.RequestHandler);

// ✅ Create a column in a board
columnRouter.post('/', authMiddleware, (async (req, res) => {
  const { title, boardId, order } = req.body;

  if (!title || !boardId) {
    return res.status(400).json({ error: 'Title and boardId are required' });
  }

  const column = await prisma.column.create({
    data: {
      title,
      boardId,
      order,
    },
  });

  res.status(201).json(column);
}) as express.RequestHandler);

// ✅ Delete a column
columnRouter.delete('/:id', authMiddleware, (async (req, res) => {
  const columnId = Number(req.params.id);

  await prisma.column.delete({
    where: {
      id: columnId,
    },
  });

  res.status(204).send();
}) as express.RequestHandler);

export default columnRouter;
