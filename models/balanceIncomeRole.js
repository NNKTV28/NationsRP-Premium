const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const balanceIncomeRole = sequelize.define('balanceincomerole', {
    role_id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    ammount_to_recieve: {
        type: Sequelize.STRING,
        allowNull: false
    },
    timer_to_recieve: {
        type: Sequelize.TIME,
        allowNull: false
    },
});

module.exports = balanceIncomeRole;