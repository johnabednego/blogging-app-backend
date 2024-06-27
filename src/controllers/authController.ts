import { Request, Response } from 'express';
import { User } from '../models/userModel';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import dotenv from 'dotenv';
import { sendEmail } from '../utils/email';
import crypto from 'crypto';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET as string;

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

export const register = async (req: Request, res: Response): Promise<Response> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, password, country, city, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailVerificationOTP = generateOTP();
    const emailVerificationExpires = new Date(Date.now() + 3600000); // 1 hour

    user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      country,
      city,
      role: role || 'user',
      emailVerificationOTP,
      emailVerificationExpires,
    });

    await user.save();

    await sendEmail(email, 'Verify your email', `Your OTP is ${emailVerificationOTP}`);

    return res.status(201).json({ msg: 'User registered. Please check your email to verify your account.' });
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ msg: 'Email not verified' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { id: user.id };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

    return res.json({ token });
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
};

export const verifyEmailOTP = async (req: Request, res: Response): Promise<Response> => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid email' });
    }

    if (user.emailVerificationOTP !== otp || user.emailVerificationExpires! < new Date()) {
      return res.status(400).json({ msg: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    return res.status(200).json({ msg: 'Email verified successfully' });
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
};

export const requestPasswordReset = async (req: Request, res: Response): Promise<Response> => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid email' });
    }

    const resetPasswordOTP = generateOTP();
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    user.resetPasswordOTP = resetPasswordOTP;
    user.resetPasswordExpires = resetPasswordExpires;

    await user.save();

    await sendEmail(email, 'Password Reset', `Your OTP is ${resetPasswordOTP}`);

    return res.status(200).json({ msg: 'Password reset OTP sent to email' });
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
};

export const verifyPasswordResetOTP = async (req: Request, res: Response): Promise<Response> => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email, resetPasswordOTP: otp, resetPasswordExpires: { $gt: new Date() } });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired OTP' });
    }

    return res.status(200).json({ msg: 'OTP verified. You can now set a new password.' });
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
};

export const setNewPassword = async (req: Request, res: Response): Promise<Response> => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid email' });
    }

    if (user.resetPasswordOTP !== otp || user.resetPasswordExpires! < new Date()) {
      return res.status(400).json({ msg: 'Invalid or expired OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({ msg: 'Password reset successfully' });
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
};

export const resendOTP = async (req: Request, res: Response): Promise<Response> => {
  const { email, type } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    const otp = generateOTP();
    let subject: string, text: string;

    if (type === 'email') {
      user.emailVerificationOTP = otp;
      user.emailVerificationExpires = new Date(Date.now() + 3600000); // 1 hour
      subject = 'Verify your email';
      text = `Your OTP is ${otp}`;
    } else if (type === 'password') {
      user.resetPasswordOTP = otp;
      user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
      subject = 'Password Reset';
      text = `Your OTP is ${otp}`;
    } else {
      return res.status(400).json({ msg: 'Invalid type' });
    }

    await user.save();

    await sendEmail(email, subject, text);

    return res.status(200).json({ msg: `${type === 'email' ? 'Verification' : 'Password reset'} OTP sent` });
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
};
