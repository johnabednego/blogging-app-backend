import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val:any) => val.message);
    return res.status(400).json({
      success: false,
      error: messages,
    });
  }
  res.status(500).json({
    success: false,
    error: 'Server Error',
  });
};
