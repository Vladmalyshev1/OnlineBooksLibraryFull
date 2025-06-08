const express = require('express');
const router = express.Router();
const { Book } = require('../models');
const { verifyAccessToken } = require('../middelware/jwt');
const { Op } = require('sequelize');

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Управление книгами
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID книги
 *         title:
 *           type: string
 *           description: Название книги
 *         author:
 *           type: string
 *           description: Автор книги
 *         description:
 *           type: string
 *           description: Описание книги
 *         category:
 *           type: string
 *           description: Категория книги
 *         price:
 *           type: number
 *           format: float
 *           description: Цена книги
 *         image:
 *           type: string
 *           description: URL обложки книги
 *         id_client:
 *           type: integer
 *           nullable: true
 *           description: ID пользователя, купившего книгу
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Дата создания записи
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Дата обновления записи
 *       example:
 *         id: 1
 *         title: "Пример книги"
 *         author: "Автор книги"
 *         description: "Подробное описание книги"
 *         category: "Фантастика"
 *         price: 9.99
 *         image: "http://example.com/book.jpg"
 *         id_client: null
 */

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Получить все книги
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Список всех книг
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       500:
 *         description: Ошибка сервера
 */
router.get('/books', async (req, res) => {
  try {
    const books = await Book.findAll();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/{category}/{id}:
 *   get:
 *     summary: Получить книгу по категории и ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Категория книги
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID книги
 *     responses:
 *       200:
 *         description: Найденная книга
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Книга не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.get('/:category/:id', async (req, res) => {
  try {
    const book = await Book.findOne({ 
      where: { 
        category: req.params.category, 
        id: req.params.id 
      } 
    });
    
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Удалить книгу (требуется аутентификация)
 *     tags: [Books]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID книги
 *     responses:
 *       200:
 *         description: Книга успешно удалена
 *       404:
 *         description: Книга не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.delete('/books/:id', async (req, res) => {
  try {
    const deletedBook = await Book.destroy({
      where: { id: req.params.id }
    });
    
    if (deletedBook) {
      res.json({ message: 'Book deleted' });
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Поиск книг
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Поисковый запрос
 *     responses:
 *       200:
 *         description: Список найденных книг
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       500:
 *         description: Ошибка сервера
 */
router.get('/search', async (req, res) => {
  const { q } = req.query;
  try {
    const books = await Book.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${q}%` } },
          { author: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } }
        ]
      }
    });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/user-books:
 *   get:
 *     summary: Получить книги пользователя (требуется аутентификация)
 *     tags: [Books]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Список книг пользователя
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       500:
 *         description: Ошибка сервера
 */
router.get('/user-books', verifyAccessToken, async (req, res) => {
  try {
    const books = await Book.findAll({ 
      where: { id_client: req.user.id } 
    });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/books/{id}/pages:
 *   get:
 *     summary: Получить текст страницы книги
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID книги
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Номер страницы
 *     responses:
 *       200:
 *         description: Текст страницы
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                   description: Текущая страница
 *                 totalPages:
 *                   type: integer
 *                   description: Всего страниц
 *                 text:
 *                   type: string
 *                   description: Текст страницы
 *       400:
 *         description: Неверный номер страницы
 *       404:
 *         description: Книга не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.get('/books/:id/pages', async (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 1;

  try {
    const book = await Book.findByPk(id);
    if (!book) {
      return res.status(404).json({ message: 'Книга не найдена' });
    }

    const pageSize = 500;
    const fakeContent = "Это содержание книги... ".repeat(10000);
    const totalPages = Math.ceil(fakeContent.length / pageSize);

    if (page < 1 || page > totalPages) {
      return res.status(400).json({ message: 'Неверный номер страницы' });
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const text = fakeContent.slice(start, end);

    res.json({
      page,
      totalPages,
      text
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при получении страницы' });
  }
});

module.exports = router;