const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Ticket = sequelize.define('ticket', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    guild_id: {
        type: Sequelize.INTEGER,
    },
    user_id: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    parentId: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    channelId: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    status: {
        type: Sequelize.STRING,
        defaultValue: 'open', // or 'closed', 'resolved', etc.
    },
    subject: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    staff_role_id: {
        type: Sequelize.STRING,
        allowNull: true,
    }
    // You can add more fields as needed, such as timestamps, assigned staff, etc.
});

module.exports = Ticket;
