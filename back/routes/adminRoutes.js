const express = require('express');
const router = express.Router();
const { User, Book } = require('../models');
const { verifyAccessToken } = require('../middelware/jwt');

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Административные операции
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Получить всех пользователей (только для админов)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Доступ запрещен
 *       500:
 *         description: Ошибка сервера
 */
router.get('/users', verifyAccessToken, isAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/**
 * @swagger
 * /api/admin/summary:
 *   get:
 *     summary: Получить статистику (только для админов)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Статистика системы
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalBooks:
 *                   type: integer
 *                   description: Общее количество книг
 *                 totalUsers:
 *                   type: integer
 *                   description: Общее количество пользователей
 *       403:
 *         description: Доступ запрещен
 *       500:
 *         description: Ошибка сервера
 */
router.get('/summary', verifyAccessToken, isAdmin, async (req, res) => {
  try {
    const totalBooks = await Book.count();
    const totalUsers = await User.count();
    res.json({ totalBooks, totalUsers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;