import { Router } from 'express';
import { editUserInfo, getAllUsers, getAllAdmins, getUserDetails, getUserInfo } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { isAdmin } from '../middlewares/roleMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /api/users/edit:
 *   put:
 *     summary: Edit user information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               country:
 *                 type: string
 *               city:
 *                 type: string
 *     responses:
 *       200:
 *         description: User information updated successfully
 *       404:
 *         description: User not found
 */
router.put('/edit', authMiddleware, editUserInfo);

/**
 * @swagger
 * /api/users/users:
 *   get:
 *     summary: Get all regular users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all users
 */
router.get('/users', authMiddleware, isAdmin, getAllUsers);

/**
 * @swagger
 * /api/users/admins:
 *   get:
 *     summary: Get all admins
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all admins
 */
router.get('/admins', authMiddleware, isAdmin, getAllAdmins);

/**
 * @swagger
 * /api/users/details/{id}:
 *   get:
 *     summary: Get user details by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successfully retrieved user details
 *       404:
 *         description: User not found
 */
router.get('/details/:id', authMiddleware, isAdmin, getUserDetails);

/**
 * @swagger
 * /api/users/info:
 *   get:
 *     summary: Get logged-in user information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user information
 *       404:
 *         description: User not found
 */
router.get('/info', authMiddleware, getUserInfo);

export default router;
