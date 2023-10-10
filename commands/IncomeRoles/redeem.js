const { SlashCommandBuilder } = require("@discordjs/builders");
const BalanceIncomeRoleModel = require("../../models/balanceIncomeRole");
const UserIncomeRedeemTimeModel = require("../../models/userIncomeRedeemTime");
const color = require("colors");
const moment = require("moment");
const balanceIncomeRole = require("../../models/balanceIncomeRole");

module.exports = {
  data: new SlashCommandBuilder().setName("redeem").setDescription("Redeem items and balance"),
  async execute(interaction) {
    const guildMember = await interaction.guild.members.fetch(interaction.user.id);
    const roles = guildMember.roles.cache.keys();
    console.log(`Todays Date: ${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}`);
    try {
      const incomeRoles = await BalanceIncomeRoleModel.findAll(
        {
          where: { guild_id: interaction.guild.id, role_id: [...roles] } // get the role from the DB that matches with the user's role
        }
      );
      const redeemedTime = await UserIncomeRedeemTimeModel.findAll(
        {
          where: { user_id: interaction.user.id } 
        }
      );
      
      for (const role of roles) {
        console.log(`Income role: ${incomeRoles}`);
        if (role) {
          //const redeemedTime = await UserIncomeRedeemTimeModel.findOne({ where: { user_id: interaction.user.id } });
          if (!redeemedTime && interaction.user.role.id === BalanceIncomeRoleModel.role_id)
          {
            console.log("Creating redeem time for user");
            await UserIncomeRedeemTimeModel.create({ user_id: interaction.user.id, balance_redeemed_time: "00:00:00" });
          }

          if (redeemedTime && redeemedTime.balance_redeemed_time && redeemedTime.item_redeemed_time) {
            // Check if enough time has passed since last redemption
            const currentTime = Date.now();
            const lastRedeemedTime = Math.max(redeemedTime.balance_redeemed_time.getTime(), redeemedTime.item_redeemed_time.getTime());
            const timeDifference = currentTime - lastRedeemedTime;
            const cooldown = parseInt(incomeRole.timer_to_recieve) * 1000; // Convert seconds to milliseconds
            if (timeDifference < cooldown) {
              await interaction.reply({ content: `You can redeem again in ${Math.ceil((cooldown - timeDifference) / 1000)} seconds.`, ephemeral: true });
              return;
            }
          }
        }
      }
      await interaction.reply({ content: "No roles found to redeem.", ephemeral: true });
    } catch (err) {
      console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[REDEEM ERROR]`)} ` + `${err}`.bgRed);
      await interaction.reply({ content: "An error occurred while redeeming.", ephemeral: true });
    }
  },
};
/*
const { SlashCommandBuilder } = require("@discordjs/builders");
const BalanceIncomeRoleModel = require("../../models/balanceIncomeRole");
const UserIncomeRedeemTimeModel = require("../../models/userIncomeRedeemTime");
const color = require("colors");
const moment = require("moment");

module.exports = {
  data: new SlashCommandBuilder().setName("redeem").setDescription("Redeem items and balance"),
  async execute(interaction) {
    const guildMember = await interaction.guild.members.fetch(interaction.user.id);
    const roles = guildMember.roles.cache.keys();
    console.log(`Todays Date: ${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}`);
    
    try {
      const incomeRoles = await BalanceIncomeRoleModel.findAll(
        {
          where: { guild_id: interaction.guild.id, role_id: [...roles] }
        }
      );
      const redeemedTime = await UserIncomeRedeemTimeModel.findOne(
        {
          where: { user_id: interaction.user.id }
        }
      );
      
      if (!redeemedTime) {
        console.log("Creating redeem time for user");
        await UserIncomeRedeemTimeModel.create({ user_id: interaction.user.id, balance_redeemed_time: Date.now() });
      } else {
        // Check if enough time has passed since last redemption
        const currentTime = Date.now();
        const lastRedeemedTime = redeemedTime.balance_redeemed_time.getTime();
        const cooldown = parseInt(incomeRoles[0].timer_to_receive) * 1000; // Assuming there's only one role in incomeRoles
        if (currentTime - lastRedeemedTime < cooldown) {
          await interaction.reply({ content: `You can redeem again in ${Math.ceil((cooldown - (currentTime - lastRedeemedTime)) / 1000)} seconds.`, ephemeral: true });
          return;
        } else {
          // Update the balance_redeemed_time in the database to the current time
          await redeemedTime.update({ balance_redeemed_time: currentTime });
        }
      }

      // Your logic for redeeming items or balance goes here
      // ...

      await interaction.reply({ content: "Item or balance redeemed successfully.", ephemeral: true });
    } catch (err) {
      console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[REDEEM ERROR]`)} ` + `${err}`.bgRed);
      await interaction.reply({ content: "An error occurred while redeeming.", ephemeral: true });
    }
  },
};

*/