import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, msg: 'Access denied. Admins only.' });
  }
};
