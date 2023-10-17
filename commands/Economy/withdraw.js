const { SlashCommandBuilder } = require("discord.js");
const BalanceModel = require("../../models/balance"); // Import your Balance model
const UserSettingsModel = require("../../models/usersettings.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('withdraw')
    .setDescription("Withdraw money from the bank and add it to your cash balance.")
    .addIntegerOption((option) =>
      option.setName("amount").setDescription("The amount to withdraw from the bank.").setRequired(true)
    )
    .setDMPermission(false),

  async execute(interaction) {
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
    await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });

    const user = interaction.user;
    const amount = interaction.options.getInteger("amount");

    try {
      // Check if the user's balance exists in the database
      let userBalance = await BalanceModel.findOne({
        where: { user_id: user.id },
      });

      if (!userBalance) {
        userBalance = await BalanceModel.create({
          user_id: user.id,
          user_balance_cash: 0,
          user_balance_bank: 0,
        });
      }

      // Check if the user has enough money in the bank
      if (userBalance.user_balance_bank < amount) {
        return interaction.editReply("You don't have enough money in the bank to withdraw that amount.");
      }

      // Withdraw the money from the bank and add it to cash balance
      userBalance.user_balance_bank -= amount;
      userBalance.user_balance_cash += amount;

      // Save the updated balance
      await userBalance.save();

      interaction.editReply(`You successfully withdrew ${amount}$ from the bank and added it to your cash balance.`);
    } catch (error) {
      console.error(error);
      interaction.editReply("An error occurred while processing your withdrawal.");
    }
  },
};
