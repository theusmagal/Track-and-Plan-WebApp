
import express, { Response } from 'express';
import prisma from '../lib/prisma'; // Prisma client instance
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth'; // Auth middleware and extended request type

// new express router for boards
const boardRouter = express.Router();

// get boards for the user
boardRouter.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const boards = await prisma.board.findMany({
      where: { userId: req.user!.userId }, // this way I filter by logged users id
      include: { columns: true }, //also the columns
    });

    res.json(boards); // returning as json format
  } catch (err) {
    console.error('Error fetching boards:', err);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

//creating new boards
boardRouter.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { title } = req.body;

  if (!title) {
    res.status(400).json({ error: 'Title is required' }); // it is a must to add titles to boards

    return;
  }

  try {
    const board = await prisma.board.create({
      data: { title, userId: req.user!.userId }, // creating board with the user id
    });

    res.status(201).json(board); // and return with the created board
  } catch (err) {
    console.error('Error creating board:', err);
    res.status(500).json({ error: 'Failed to create board' });
  }
});

//delete a board with everything inside. all columns and cards
boardRouter.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const boardId = Number(req.params.id);

  try {
    const board = await prisma.board.findUnique({ where: { id: boardId } });

    if (!board || board.userId !== req.user!.userId) {
      res.status(404).json({ error: 'Board not found or access denied' });
      return;
    }

    await prisma.card.deleteMany({
      where: {
        column: {
          boardId: boardId,
        },
      },
    });

    // delete all columns in the board
    await prisma.column.deleteMany({
      where: {
        boardId: boardId,
      },
    });

    // deleting the board
    await prisma.board.delete({ where: { id: boardId } });

    res.status(204).send(); 
  } catch (err) {
    console.error('Error deleting board:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//updating the tile of the board
boardRouter.patch('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const boardId = Number(req.params.id);
  const { title } = req.body;

  // checking the input
  if (!title || typeof title !== 'string') {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  try {
    // making sure the boards is there and belongs the user
    const board = await prisma.board.findUnique({ where: { id: boardId } });

    if (!board || board.userId !== req.user!.userId) {
      res.status(404).json({ error: 'Board not found or access denied' });
      return;
    }

    // updating the boards title
    const updated = await prisma.board.update({
      where: { id: boardId },
      data: { title },
    });

    res.status(200).json(updated); // return updated board
  } catch (err) {
    console.error('Error updating board title:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default boardRouter;
