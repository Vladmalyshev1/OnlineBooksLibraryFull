const { Sequelize, DataTypes } = require('sequelize');

const User = (sequelize) => {
  return sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING
    },
    address: {
      type: DataTypes.STRING
    },
    country: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    profileImage: {
      type: DataTypes.STRING
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user'
    },
    refreshToken: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: false,
    updatedAt: false
  });
};

module.exports = User;