import { Request, Response } from 'express';
import { Post } from '../models/postModel';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middlewares/authMiddleware';

export const createPost = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, content } = req.body;

  try {
    if (!req.user) {
      return res.status(401).json({ msg: 'No user found in request' });
    }
    const newPost = new Post({
      title,
      content,
      author: req.user.id, // Derive author from authenticated user
    });

    const post = await newPost.save();
    res.status(201).json(post);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

export const getPosts = async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const posts = await Post.find()
      .populate('author', 'username')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .exec();

    res.json(posts);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

export const getPost = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username');
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.json(post);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

export const updatePost = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, content } = req.body;

  try {
    let post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    if (post.author.toString() !== req.user?.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    post = await Post.findByIdAndUpdate(req.params.id, { $set: { title, content } }, { new: true });

    res.json(post);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    if (post.author.toString() !== req.user?.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Post.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Post removed' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
