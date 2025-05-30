const { Sequelize } = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(process.env.PG_DATABASE, process.env.PG_USER, process.env.PG_PASSWORD, {
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  dialect: 'postgres',
  logging: false,
});

const User = require('./User')(sequelize);
const Book = require('./Book')(sequelize);

sequelize.sync({ alter: true })
  .then(() => console.log('Models synchronized with database'))
  .catch(err => console.error('Error synchronizing models:', err));

module.exports = {
  sequelize,
  User,
  Book,
};