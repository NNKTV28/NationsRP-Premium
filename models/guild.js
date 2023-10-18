const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Guild = sequelize.define('guild', {
    guild_id: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    ticket_parent_category: {
        type: Sequelize.STRING,
        allowNull: true
    }
});

module.exports = Guild;