const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const userItemRedeemTime = sequelize.define('useritemredeemtime', {
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
    item_redeemed_time: {
        type: Sequelize.STRING,
        allowNull: true
    },
});

module.exports = userItemRedeemTime;