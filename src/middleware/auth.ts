import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'users.json');

export interface AuthRequest extends Request {
  user?: any;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const userId = authHeader.split('Bearer ')[1];
  try {
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    const user = users.find((u: any) => u.id === userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Error verifying local token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
