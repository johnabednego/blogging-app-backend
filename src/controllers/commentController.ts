import { Request, Response } from 'express';
import { Comment } from '../models/commentModel';
import { Post } from '../models/postModel';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middlewares/authMiddleware';

export const createComment = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { content, postId } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    const newComment = new Comment({
      content,
      author: req.user?.id, // Ensure this is a string
      post: postId,
    });

    const comment = await newComment.save();
    res.json(comment);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

export const getComments = async (req: Request, res: Response) => {
  const { postId, page = 1, limit = 10 } = req.query;

  try {
    const comments = await Comment.find({ post: postId })
      .populate('author', 'username')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .exec();

    res.json(comments);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user?.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Comment.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Comment removed' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
