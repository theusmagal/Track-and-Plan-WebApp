
import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt'; // for password hashing
import jwt from 'jsonwebtoken'; 
import prisma from '../lib/prisma';
import {
  authMiddleware,
  AuthenticatedRequest,
  JWT_SECRET,
} from '../middleware/auth'; 

// router for auth issues
const registerRouter = express.Router();

//register new user
registerRouter.post(
  '/register',
  (async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    //check if the email is already in use
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    //hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // creating a new user in db
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Create a JWT token with user id
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    //return the token to the frontend
    res.status(201).json({ token });
  }) as express.RequestHandler
);

//login the user
registerRouter.post(
  '/login',
  (async (req: Request, res: Response) => {
    const { email, password } = req.body;

    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    //find the user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    //compare the hashed password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    //generate a new token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    //return the token
    res.status(200).json({ token });
  }) as express.RequestHandler
);

//this is only a test route to check if user is authenticated
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
