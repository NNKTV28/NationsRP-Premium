const Guild = require('./models/guild');
const Store = require('./models/store');
const ItemIncomeRole = require('./models/itemIncomeRole');
const BalanceIncomeRole = require('./models/balanceIncomeRole');
const Balance = require('./models/balance');
const Inventory = require('./models/inventory');
const Ticket = require('./models/ticket');
const AdminRoles = require('./models/adminroles');
const BlackMarket = require('./models/blackMarket');

Guild.sync({alter: true});
Store.sync({alter: true});
ItemIncomeRole.sync({alter: true});
BalanceIncomeRole.sync({alter: true});
Balance.sync({alter: true});
Inventory.sync({alter: true});
Ticket.sync({alter: true});
AdminRoles.sync({alter: true});
BlackMarket.sync({alter: true});
