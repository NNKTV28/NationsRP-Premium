const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Guild = sequelize.define('guild', {
    guild_id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
    },
    embed_color: {
        type: Sequelize.STRING,
        allowNull: true
    }
});

module.exports = Guild;