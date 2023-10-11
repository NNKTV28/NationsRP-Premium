const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const userIncomeRedeemTime = sequelize.define('userincomeredeemtime', {
    user_id:{
        type: Sequelize.STRING,
        primaryKey: true
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