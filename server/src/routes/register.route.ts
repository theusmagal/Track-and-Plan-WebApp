import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import {
  authMiddleware,
  AuthenticatedRequest,
  JWT_SECRET,
} from '../middleware/auth';

const registerRouter = express.Router();

// REGISTER
registerRouter.post(
  '/register',
  (async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token });
  }) as express.RequestHandler
);

// LOGIN
registerRouter.post( '/login', (async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  }) as express.RequestHandler
);

// PROTECTED TEST ROUTE
registerRouter.get(
  '/me',
  authMiddleware,
  ((req: AuthenticatedRequest, res: Response) => {
    res.status(200).json({
      message: 'You are authenticated ✅',
      userId: req.user?.userId,
    });
  }) as express.RequestHandler
);

export default registerRouter;
