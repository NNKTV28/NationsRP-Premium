const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const userIncomeRedeemTime = sequelize.define('userincomeredeemtime', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    role_id:{
        type: Sequelize.STRING,
        allowNull: true
    },
    user_id:{
        type: Sequelize.STRING,
        allowNull: true
    },
    balance_redeemed_time: {
        type: Sequelize.STRING,
        allowNull: true
    },
});

module.exports = userIncomeRedeemTime;