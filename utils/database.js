const Sequelize = require('sequelize');
const sequelize = new Sequelize("database", "username", "password", 
{
    dialect: 'sqlite',
    host: 'localhost',
    storage: 'MainDB.sqlite',
    loggin: false,
})

module.exports = sequelize;