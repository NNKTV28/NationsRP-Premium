const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const itemIncomeRole = sequelize.define('itemincomerole', {
    guild_id: {
        type: Sequelize.STRING,
    },
    role_id: {
        type: Sequelize.STRING,
        primaryKey: true
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