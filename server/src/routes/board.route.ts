import express, { Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const boardRouter = express.Router();

// Get all boards for the logged-in user
boardRouter.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const boards = await prisma.board.findMany({
      where: { userId: req.user!.userId },
      include: { columns: true },
    });

    res.json(boards);
  } catch (err) {
    console.error('Error fetching boards:', err);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

// Create a new board
boardRouter.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { title } = req.body;

  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  try {
    const board = await prisma.board.create({
      data: { title, userId: req.user!.userId },
    });

    res.status(201).json(board);
  } catch (err) {
    console.error('Error creating board:', err);
    res.status(500).json({ error: 'Failed to create board' });
  }
});

// Delete a board with manual cascading delete
boardRouter.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const boardId = Number(req.params.id);

  try {
    const board = await prisma.board.findUnique({ where: { id: boardId } });

    if (!board || board.userId !== req.user!.userId) {
      res.status(404).json({ error: 'Board not found or access denied' });
      return;
    }

    // Delete all cards in the columns of this board
    await prisma.card.deleteMany({
      where: {
        column: {
          boardId: boardId,
        },
      },
    });

    // Delete all columns in this board
    await prisma.column.deleteMany({
      where: {
        boardId: boardId,
      },
    });

    // Delete the board
    await prisma.board.delete({ where: { id: boardId } });

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting board:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a board's title
boardRouter.patch('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const boardId = Number(req.params.id);
  const { title } = req.body;

  if (!title || typeof title !== 'string') {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  try {
    const board = await prisma.board.findUnique({ where: { id: boardId } });

    if (!board || board.userId !== req.user!.userId) {
      res.status(404).json({ error: 'Board not found or access denied' });
      return;
    }

    const updated = await prisma.board.update({
      where: { id: boardId },
      data: { title },
    });

    res.status(200).json(updated);
  } catch (err) {
    console.error('Error updating board title:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default boardRouter;
