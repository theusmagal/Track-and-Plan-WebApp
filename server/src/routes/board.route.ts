import express from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const boardRouter = express.Router();

// Get all boards for the logged-in user
boardRouter.get('/', authMiddleware,(async (req: AuthenticatedRequest, res) => {
    const boards = await prisma.board.findMany({
      where: { userId: req.user!.userId },
      include: { columns: true },
    });

    res.json(boards);
  }) as express.RequestHandler
);

// Create a new board
boardRouter.post('/', authMiddleware, (async (req: AuthenticatedRequest, res) => {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const board = await prisma.board.create({
      data: {
        title,
        userId: req.user!.userId,
      },
    });

    res.status(201).json(board);
  }) as express.RequestHandler
);

export default boardRouter;
