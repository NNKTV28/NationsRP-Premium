const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Balance = sequelize.define('balance', {
    guild_id: {
        type: Sequelize.STRING,
    },
    user_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
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