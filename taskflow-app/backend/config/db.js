require('dotenv').config();
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  logging: false,
});
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected!');
  } catch (err) {
    console.error('DB connection error:', err);
  }
};
module.exports = { sequelize, connectDB };