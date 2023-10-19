const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const itemIncomeRole = sequelize.define('itemincomerole', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    guild_id: {
        type: Sequelize.STRING,
    },
    role_id: {
        type: Sequelize.STRING,
    },
    item_to_recieve: {
        type: Sequelize.STRING,
        allowNull: false
    },
    amount_to_recieve: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    cooldown_timer: {
        type: Sequelize.STRING,
        allowNull: false
    },
});

module.exports = itemIncomeRole;