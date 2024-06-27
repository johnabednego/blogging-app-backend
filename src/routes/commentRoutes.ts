import { Router } from 'express';
import { check } from 'express-validator';
import { authMiddleware } from '../middlewares/authMiddleware';
import { createComment, getComments, deleteComment } from '../controllers/commentController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Comments management endpoints
 */

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - postId
 *             properties:
 *               content:
 *                 type: string
 *               postId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Bad request
 */
router.post(
  '/',
  authMiddleware,
  [
    check('content', 'Content is required').not().isEmpty(),
    check('postId', 'Post ID is required').not().isEmpty()
  ],
  createComment
);

/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: Get all comments for a post
 *     tags: [Comments]
 *     parameters:
 *       - in: query
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of comments per page
 *     responses:
 *       200:
 *         description: Successfully retrieved all comments
 */
router.get('/', getComments);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 *       401:
 *         description: User not authorized
 */
router.delete('/:id', authMiddleware, deleteComment);

export default router;
