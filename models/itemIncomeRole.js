const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const itemIncomeRole = sequelize.define('itemincomerole', {
    role_id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    item_to_recieve: {
        type: Sequelize.STRING,
        allowNull: false
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

module.exports = itemIncomeRole;