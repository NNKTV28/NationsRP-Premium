const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Guild = sequelize.define('guild', {
    guild_id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
    },
    welcomeChannelID: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    welcomeMessage:  {
        type: Sequelize.STRING,
        allowNull: true
    },
    welcomeRoleID: {
        type: Sequelize.STRING,
        allowNull: true
    },
    Status: {
        type: Sequelize.BOOLEAN,
    },
    EmbedColor: {
        type: Sequelize.STRING,
        allowNull: true
    }
});

module.exports = Guild;