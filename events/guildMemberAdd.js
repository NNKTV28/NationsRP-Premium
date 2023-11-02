const BalanceModel = require('../models/balance');
const GuildModel = require('../models/guild');
const UserSettingsModel = require("../models/usersettings");
const color = require("colors");
const moment = require("moment");

module.exports = {
  name: "guildMemberAdd",
  
  async execute(member) {
    try {
      const user = member.user;
      const userBalance = await BalanceModel.findOne({
        where: { user_id: member.id },
      });
      
      let userRecord = await UserSettingsModel.findOne({
        where: { user_id: user.id },
      });

      if (!userRecord) {
        console.log(`User ${user.id} is not in the database, adding it now`);
        if (user.bot) {
          userRecord = await UserSettingsModel.create({
            guild_id: guildID,
            user_id: user.id,
            is_bot: true,
            ephemeral_message: false,
            embed_color: config.defaultEmbedColor
          });
        }else{
          userRecord = await UserSettingsModel.create({
            guild_id: guildID,
            user_id: user.id,
            is_bot: false,
            ephemeral_message: false,
            embed_color: config.defaultEmbedColor
          });
        } 
      }
      // check if the User is a bot
      if (user.bot) {
        return;
      }else{
        if (!userBalance) {
          await BalanceModel.create({
            guild_id: guildID,
            user_id: user.id,
            user_balance_cash: 0,
            user_balance_bank: 0,
          });
        }
      }      
    } catch (err) {
        console.error(err);
      //console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[GUILD MEMBER ADD ERROR]`)} ` + `${err}`.bgRed);
    }
  }
};