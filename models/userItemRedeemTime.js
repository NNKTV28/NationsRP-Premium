const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const userItemRedeemTime = sequelize.define('useritemredeemtime', {
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
    item_redeemed_time: {
        type: Sequelize.STRING,
        allowNull: false
    },
});

module.exports = userItemRedeemTime;