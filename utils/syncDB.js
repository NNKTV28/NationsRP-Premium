const models = [
    require('../models/guild'),
    require('../models/store'),
    require('../models/itemIncomeRole'),
    require('../models/balanceIncomeRole'),
    require('../models/balance'),
    require('../models/inventory'),
    require('../models/ticket'),
    require('../models/adminroles'),
    require('../models/blackMarket'),
    require('../models/usersettings'),
    require('../models/userIncomeRedeemTime'),
    require('../models/userItemRedeemTime'),
  ];
  
  // Sync all models
  models.forEach((model) => {
    model.sync({ force: true, alter: true });
  });
  