const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const balanceIncomeRole = sequelize.define('balanceincomerole', {
    guild_id: {
        type: Sequelize.STRING,
    },
    role_id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    ammount_to_recieve: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    cooldown_timer: {
        type: Sequelize.STRING,
        allowNull: false
    },
});

module.exports = balanceIncomeRole;