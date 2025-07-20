
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// checking if JWT exists in the environment variables
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from your environment variables.");
}

// exporting to be used in others files
export const JWT_SECRET = process.env.JWT_SECRET;

// extending the express request type
export interface AuthenticatedRequest extends Request {
  user?: { userId: number };
}

// function to protect routes and verify jwt
export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization; // getting the authorization header

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid token' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    // connecting the user id to the object for uses in routes
    req.user = { userId: decoded.userId };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
