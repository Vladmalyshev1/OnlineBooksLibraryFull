
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();


const sequelize = new Sequelize(
  process.env.PG_DATABASE,    
  process.env.PG_USER,       
  {
    host: process.env.PG_HOST,    
    port: process.env.PG_PORT,      
    dialect: 'postgres',           
    logging: false,            
    pool: {
      max: 5,              
      min: 0,         
      acquire: 30000,  
      idle: 10000  
    },
    define: {
      timestamps: true, 
      underscored: true, 
      freezeTableName: true      
    }
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to PostgreSQL has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the PostgreSQL database:', error);
    process.exit(1); 
  }
};

testConnection();

module.exports = {
  sequelize,
  Sequelize
};