const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const userIncomeRedeemTime = sequelize.define('userincomeredeemtime', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id:{
        type: Sequelize.STRING,
    },
    balance_redeemed_time: {
        type: Sequelize.STRING,
        allowNull: true
    },
    item_redeemed_time: {
        type: Sequelize.STRING,
        allowNull: true
    },
});

module.exports = userIncomeRedeemTime;