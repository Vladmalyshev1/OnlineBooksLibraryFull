const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const { sequelize } = require('./models'); 
const { swaggerUi, swaggerSpec } = require('./swagger');

dotenv.config();

const app = express();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(bodyParser.json());
app.use(cookieParser());


app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true,
}));

sequelize.authenticate()
  .then(() => console.log('PostgreSQL connected'))
  .catch(err => console.error('Unable to connect to PostgreSQL:', err));

sequelize.sync({ alter: true })
  .then(() => console.log('Database synchronized'))
  .catch(err => console.error('Error synchronizing database:', err));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/bookRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGINT', async () => {
  try {
    await sequelize.close();
    console.log('PostgreSQL connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error closing PostgreSQL connection:', err);
    process.exit(1);
  }
});