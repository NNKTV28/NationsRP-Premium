const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Store = sequelize.define('store', {
    itemName: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    itemQuantity: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    itemPrice: {
        type: Sequelize.STRING,
        allowNull: false
    },
    itemDescription: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Store;