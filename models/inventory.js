const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Inventory = sequelize.define('inventory', {
    user_id: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    item_Name: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    item_Amount: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    role_to_use: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Inventory;