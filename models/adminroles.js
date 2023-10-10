const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const AdminRoles = sequelize.define('adminroles', {
    role_id: {
        type: Sequelize.STRING,
        primaryKey: true
    }
});

module.exports = AdminRoles;