const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Balance = sequelize.define('balance', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    guild_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    user_id: {
        type: Sequelize.STRING,
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