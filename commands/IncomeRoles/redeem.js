const { SlashCommandBuilder } = require("@discordjs/builders");
const BalanceIncomeRoleModel = require("../../models/balanceIncomeRole");
const UserIncomeRedeemTimeModel = require("../../models/userIncomeRedeemTime");

module.exports = {
  data: new SlashCommandBuilder().setName("redeem").setDescription("Redeem items and balance"),
  async execute(interaction) {
    const guildMember = await interaction.guild.members.fetch(interaction.user.id);
    const roles = guildMember.roles.cache;

    try {
      const incomeRoles = await BalanceIncomeRoleModel.findAll();
      console.log(`There are income roless: ${incomeRoles.toString()}`);
      for (const role of roles) {
        const incomeRole = incomeRoles.find((role_id) => role_id == role.id); // Use arrow function syntax here

        if (incomeRole) {
          const redeemedTime = await UserIncomeRedeemTimeModel.findOne({ where: { user_id: interaction.user.id } });
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

            /*
            const seconds = Math.round(Date.now() / 1000);
            await interaction.reply(`DankRPG has been up since <t:${Math.round(seconds - process.uptime())}:R>`);
            */
            if (timeDifference < cooldown) {
              await interaction.reply({ content: `You can redeem again in ${Math.ceil((cooldown - timeDifference) / 1000)} seconds.`, ephemeral: true });
              return;
            }
          }

          // Redeem items and balance here
        }
      }
      await interaction.reply({ content: "No roles found to redeem.", ephemeral: true });
    } catch (err) {
      console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[COMMAND ERROR]`)} ` + `${err}`.bgRed);
      await interaction.reply({ content: "An error occurred while redeeming.", ephemeral: true });
    }
  },
};
