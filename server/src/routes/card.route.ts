
import express from 'express';
import prisma from '../lib/prisma'; 
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth'; // Auth and extended request type

// router for cards
const cardRouter = express.Router();

//getting cards for specific column.. using colunmId
cardRouter.get('/:columnId', authMiddleware, (async (req, res) => {
  const columnId = Number(req.params.columnId); // Extract column ID from the route parameter

  const cards = await prisma.card.findMany({
    where: { columnId }, // filter cards by column id
    orderBy: { order: 'asc' }, 
  });

  res.json(cards); // return cards as json
}) as express.RequestHandler);

//creating new card
cardRouter.post('/', authMiddleware, (async (req, res) => {
  const { title, columnId, order, color } = req.body;

  // must to add a title
  if (!title || !columnId) {
    return res.status(400).json({ error: 'Title and columnId are required' });
  }

  const card = await prisma.card.create({
    data: {
      title,
      columnId,
      order,
      color,
    },
  });

  res.status(201).json(card); // Return created card
}) as express.RequestHandler);

// updating card
cardRouter.put('/:id', authMiddleware, (async (req, res) => {
  const cardId = Number(req.params.id);
  const { title, columnId, order, color } = req.body;

  // at least one field updated
  if (!title && !columnId && order === undefined && !color) {
    return res.status(400).json({ error: 'No fields provided to update' });
  }

  const updatedCard = await prisma.card.update({
    where: { id: cardId },
    data: {
      ...(title && { title }),
      ...(columnId && { columnId }),
      ...(order !== undefined && { order }),
      ...(color && { color }),
    },
  });

  res.json(updatedCard); // Return updated card
}) as express.RequestHandler);


// update the order (and columnId if needed) for cards as we can drag and drop
cardRouter.patch('/reorder', authMiddleware, (async (req, res) => {
  const { cards } = req.body; 
  const updates = await Promise.all(
    cards.map(({ id, order, columnId }: { id: number; order: number; columnId: number }) =>
      prisma.card.update({
        where: { id },
        data: { order, columnId },
      })
    )
  );

  res.json({ message: 'Cards reordered', updated: updates });
}) as express.RequestHandler);

//deleting cards by id. 
//Comments will also be deleted using cascade in schema.prisma
cardRouter.delete('/:id', authMiddleware, (async (req, res) => {
  const cardId = Number(req.params.id);

  await prisma.card.delete({
    where: { id: cardId },
  });

  res.status(204).send(); 
}) as express.RequestHandler);

export default cardRouter;
