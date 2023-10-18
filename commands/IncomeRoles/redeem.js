const { SlashCommandBuilder } = require("@discordjs/builders");
const BalanceIncomeRoleModel = require("../../models/balanceIncomeRole");
const UserIncomeRedeemTimeModel = require("../../models/userIncomeRedeemTime");
const UserBalanceModel = require("../../models/balance");
const color = require("colors");
const moment = require("moment");
const UserSettingsModel = require("../../models/usersettings.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("redeem")
    .setDescription("Redeem items and balance"),

  async execute(interaction) {
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
    await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });

    const guildMember = await interaction.guild.members.fetch(interaction.user.id);
    const roles = guildMember.roles.cache.keys();
    console.log(`Todays Date: ${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}`);

    try {
      const balanceIncomeRoles = await BalanceIncomeRoleModel.findAll(
        {
          where: { guild_id: interaction.guild.id, role_id: [...roles] }
        }
      );
      const redeemedTime = await UserIncomeRedeemTimeModel.findOne(
        {
          where: { user_id: interaction.user.id }
        }
      );
      const balance = await UserBalanceModel.findOne(
        {
          where: { user_id: interaction.user.id }
        }
      );

      if (!redeemedTime) {
        console.log("Creating redeem time for user");
        await UserIncomeRedeemTimeModel.create({ user_id: interaction.user.id, balance_redeemed_time: Date.now() });
      } else {
        const currentTime = Date.now();
        const lastRedeemedTime = redeemedTime.balance_redeemed_time;

        if (!lastRedeemedTime) {
          lastRedeemedTime = currentTime;
        }
        const cooldown = balanceIncomeRoles.reduce((acc, curr) => acc + parseInt(curr.timer_to_recieve) * 1000, 0);

        const timeElapsed = currentTime - lastRedeemedTime;

        console.log(`Current Time: ${currentTime}`);
        console.log(`Last Redeemed Time: ${lastRedeemedTime}`);
        console.log(`Cooldown: ${cooldown} milliseconds`);

        if (timeElapsed < cooldown) {
          const remainingCooldown = cooldown - timeElapsed;
          const remainingSeconds = Math.ceil(remainingCooldown / 1000);
          // parse remainingSecconds to HH:MM:SS format
          const remainingTime = moment.utc(remainingSeconds * 1000).format("HH:mm:ss");

          await interaction.editReply({ content: `You can redeem again in ${remainingTime} Hours.`});
          return;
        } else {
          // Update the balance_redeemed_time in the database to the current time
          redeemedTime.balance_redeemed_time = currentTime;
          await redeemedTime.save();
        }
      }

      if (!balance) {
        balance.user_balance_cash = balanceIncomeRoles[0].ammount_to_recieve;
        balance.user_balance_bank = 0;
      } else {
        balance.user_balance_cash = balance.user_balance_cash + balanceIncomeRoles[0].ammount_to_recieve;
      }

      await balance.save();
      await interaction.editReply({ content: "Balance redeemed successfully."});

    } catch (err) {
      console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[REDEEM ERROR]`)} ` + `${err}`.bgRed);
      await interaction.editReply({ content: "An error occurred while redeeming."});
    }
  },
};
