import express, { Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

// router for columns
const columnRouter = express.Router();

//get all columns for specific board
columnRouter.get('/:boardId', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const boardId = Number(req.params.boardId); //get board ID from the URL

  try {
    const columns = await prisma.column.findMany({
      where: {
        boardId,
        board: {
          userId: req.user!.userId, //ensure the board belongs the user
        },
      },
      include: {
        cards: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            columnId: true,
            order: true,
            createdAt: true,
            updatedAt: true,
            color: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    res.json(columns); //return the columns with cards
  } catch (err) {
    console.error('Error fetching columns:', err);
    res.status(500).json({ error: 'Failed to fetch columns' });
  }
});

//create column
columnRouter.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { title, boardId, order } = req.body;

  if (!title || !boardId) {
    res.status(400).json({ error: 'Title and boardId are required' });
    return;
  }

  try {
    const column = await prisma.column.create({
      data: { title, boardId, order },
    });

    res.status(201).json(column); //return created column
  } catch (err) {
    console.error('Error creating column:', err);
    res.status(500).json({ error: 'Failed to create column' });
  }
});

//deleting column.. 
//cards and comments are also deleted by using cascade in schema.prisma
columnRouter.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const columnId = Number(req.params.id);

  try {
    await prisma.column.delete({
      where: { id: columnId },
    });

    res.status(204).send(); // No content
  } catch (err) {
    console.error('Error deleting column:', err);
    res.status(500).json({ error: 'Failed to delete column' });
  }
});

//reordering columns as we can drag and drop
columnRouter.patch('/reorder', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { columns } = req.body; //expects an array of columns

  try {
    const updates = await Promise.all(
      columns.map(({ id, order }: { id: number; order: number }) =>
        prisma.column.update({ where: { id }, data: { order } })
      )
    );

    res.json({ message: 'Columns reordered', updated: updates });
  } catch (err) {
    console.error('Error reordering columns:', err);
    res.status(500).json({ error: 'Failed to reorder columns' });
  }
});

//updating the title of a column
columnRouter.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const columnId = Number(req.params.id);
  const { title } = req.body;

  //validate input
  if (!title || typeof title !== 'string') {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  try {
    //find the column and make sure the board belongs to the user
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      include: { board: true },
    });

    if (!column || column.board.userId !== req.user!.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // update column title
    const updated = await prisma.column.update({
      where: { id: columnId },
      data: { title },
    });

    res.json(updated);
  } catch (err) {
    console.error('Error updating column title:', err);
    res.status(500).json({ error: 'Failed to update column title' });
  }
});

export default columnRouter;
