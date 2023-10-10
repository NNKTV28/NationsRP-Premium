const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const BlackMarket = sequelize.define('blackmarket', {
    seller_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    itemName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    itemPrice: {
        type: Sequelize.STRING,
        allowNull: false
    },
    itemDescription: {
        type: Sequelize.STRING,
        allowNull: false
    },
    itemCuantity: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

module.exports = BlackMarket;