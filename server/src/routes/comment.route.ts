import express, { Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const commentRouter = express.Router();

// Get all comments for a card
commentRouter.get('/:cardId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const cardId = Number(req.params.cardId);
  const comments = await prisma.comment.findMany({
    where: { cardId },
    orderBy: { createdAt: 'asc' },
  });
  res.json(comments);
});

// Add new comment
commentRouter.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { cardId, text } = req.body;
  const comment = await prisma.comment.create({
    data: { cardId, text },
  });
  res.status(201).json(comment);
});

// Update comment
commentRouter.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const id = Number(req.params.id);
  const { text } = req.body;
  const updated = await prisma.comment.update({
    where: { id },
    data: { text },
  });
  res.json(updated);
});

// Delete comment
commentRouter.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const id = Number(req.params.id);
  await prisma.comment.delete({ where: { id } });
  res.status(204).send();
});

export default commentRouter;
