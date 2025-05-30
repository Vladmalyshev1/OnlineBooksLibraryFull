const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const router = express.Router();
const { jwtMiddleware } = require('../middelware/jwt');
const { User } = require('../models');

cloudinary.config({
  cloud_name: 'djux9krem',
  api_key: '639144162891629',
  api_secret: 'cqldqET6lDIs4iM9WAkf5DV4Adg'
});

/**
 * @swagger
 * /signature:
 *   get:
 *     summary: Получить подпись для загрузки на Cloudinary
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Возвращает timestamp и signature
 */
router.get('/signature', (req, res) => {
  const timestamp = Math.round((new Date).getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request({
    timestamp: timestamp,
    folder: 'user_uploads'
  }, cloudinary.config().api_secret);
  res.json({ timestamp, signature });
});

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 */
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /signin:
 *   post:
 *     summary: Вход пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Вход успешен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 role:
 *                   type: string
 */
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1w' }
    );

    res.cookie('token', token, { httpOnly: true });

    res.status(200).json({
      message: `${user.role === 'admin' ? 'Admin' : 'User'} signed in successfully`,
      token: token,
      role: user.role
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Получить профиль пользователя
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Информация о пользователе
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get('/profile', jwtMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

/**
 * @swagger
 * /profile:
 *   put:
 *     summary: Обновить профиль пользователя
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               country:
 *                 type: string
 *               profileImage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Профиль успешно обновлён
 */
router.put('/profile', jwtMiddleware, async (req, res) => {
  const { username, phone, address, country, profileImage } = req.body;

  try {
    let user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.username = username || user.username;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.country = country || user.country;
    user.profileImage = profileImage || user.profileImage;

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Выход из аккаунта
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Успешный выход
 */
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
});

/**
 * @swagger
 * /check_authenticateToken:
 *   post:
 *     summary: Проверить токен авторизации
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Пользователь авторизован
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */
router.post('/check_authenticateToken', jwtMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;