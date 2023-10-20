// Import models
const AdminRolesModel = require('../models/adminroles')
const BalanceModel = require('../models/balance')
const BalanceIncomeRoleModel = require('../models/balanceIncomeRole')
const BlackMarketModel = require('../models/blackMarket')
const GuildModel = require('../models/guild');
const UserSettingsModel = require('../models/usersettings')

const addUserToDB = () => {
        
}
const checkIfUserExists = () => {
}

const addToUserInventory = () => {
}

const findAllBalanceIncomeRoles = () => {
    const balanceRoles = balanceIncomeList.findAll({
        attributes: ['role_id', 'amount_to_recieve', 'cooldown_timer']
      });
}
    

module.exports = {
    addUserToDB,
    checkIfUserExists,
    addToUserInventory,
    findAllBalanceIncomeRoles,
}