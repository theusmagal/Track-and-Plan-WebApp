import express from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const cardRouter = express.Router();

// Get all cards for a specific column
cardRouter.get('/:columnId', authMiddleware, (async (req, res) => {
  const columnId = Number(req.params.columnId);

  const cards = await prisma.card.findMany({
    where: { columnId },
    orderBy: { order: 'asc' },
  });

  res.json(cards);
}) as express.RequestHandler);

// Create a card in a column
cardRouter.post('/', authMiddleware, (async (req, res) => {
  const { title, columnId, order } = req.body;

  if (!title || !columnId) {
    return res.status(400).json({ error: 'Title and columnId are required' });
  }

  const card = await prisma.card.create({
    data: {
      title,
      columnId,
      order,
    },
  });

  res.status(201).json(card);
}) as express.RequestHandler);

// Update a card (title, columnId, and/or order)
cardRouter.put('/:id', authMiddleware, (async (req, res) => {
  const cardId = Number(req.params.id);
  const { title, columnId, order } = req.body;

  if (!title && !columnId && order === undefined) {
    return res.status(400).json({ error: 'No fields provided to update' });
  }

  const updatedCard = await prisma.card.update({
    where: { id: cardId },
    data: {
      ...(title && { title }),
      ...(columnId && { columnId }),
      ...(order !== undefined && { order }),
    },
  });

  res.json(updatedCard);
}) as express.RequestHandler);

// Reorder multiple cards
cardRouter.patch('/reorder', authMiddleware, (async (req, res) => {
  const { cards } = req.body; // expects [{ id: number, order: number }, ...]

  const updates = await Promise.all(
    cards.map(({ id, order }: { id: number; order: number }) =>
      prisma.card.update({
        where: { id },
        data: { order },
      })
    )
  );

  res.json({ message: 'Cards reordered', updated: updates });
}) as express.RequestHandler);

// Delete a card
cardRouter.delete('/:id', authMiddleware, (async (req, res) => {
  const cardId = Number(req.params.id);

  await prisma.card.delete({
    where: { id: cardId },
  });

  res.status(204).send();
}) as express.RequestHandler);

export default cardRouter;
