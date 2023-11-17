const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const userIncomeRedeemTime = sequelize.define('userincomeredeemtime', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    guild_id:{
        type: Sequelize.STRING,
        allowNull: false
    },
    role_id:{
        type: Sequelize.STRING,
        allowNull: false
    },
    user_id:{
        type: Sequelize.STRING,
        allowNull: false
    },
    balance_redeemed_time: {
        type: Sequelize.STRING,
        allowNull: false
    },
});

module.exports = userIncomeRedeemTime;