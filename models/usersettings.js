const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const userSettings = sequelize.define('usersettings', {
    guild_id:{
        type:  Sequelize.STRING,
        allowNull: false
    },
    user_id:{
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
        
    },
    is_bot: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    ephemeral_message: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    }
});

module.exports = userSettings;