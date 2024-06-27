import { Request, Response, NextFunction } from 'express';
import { User } from '../models/userModel';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({ role: 'user' });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

export const getAllAdmins = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admins = await User.find({ role: 'admin' });
    res.json({ success: true, data: admins });
  } catch (err) {
    next(err);
  }
};

export const editUserInfo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { firstName, lastName, country, city } = req.body;

  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.country = country || user.country;
    user.city = city || user.city;

    await user.save();

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const getUserDetails = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const getUserInfo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
