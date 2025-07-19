import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from your environment variables.");
}
export const JWT_SECRET = process.env.JWT_SECRET;


export interface AuthenticatedRequest extends Request {
  user?: { userId: number };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid token' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.user = { userId: decoded.userId };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
