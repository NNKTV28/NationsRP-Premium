const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Balance = sequelize.define('balance', {
    user_id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    user_balance_cash: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    user_balance_bank: {
        type: Sequelize.INTEGER,
        allowNull: true
    }
});

module.exports = Balance;