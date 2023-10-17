const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const BalanceModel = require('../../models/balance');
const globals = require("../../utils/globals.js");
const UserSettingsModel = require("../../models/usersettings.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Shows the user's Cash balance and Bank balance.")
    .addUserOption(option => option
      .setName('user')
      .setDescription('The user to add money to')
      .setRequired(false)
    )
    .setDMPermission(false),

  async execute(interaction) {
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
    await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });

    try {
      const targetUser = interaction.options.getMember('user') || interaction.user;

      let userBalances = await BalanceModel.findOne({
        where: { user_id: targetUser.id },
      });

      if (!userBalances) {
        interaction.editReply('No balance data found. Inserting user into the database...');
        userBalances = await BalanceModel.create({
          user_id: targetUser.id,
          user_balance_cash: 0, // Set initial cash balance to 0
          user_balance_bank: 0, // Set initial bank balance to 0
        });
      }else{
        interaction.editReply(`User: ${interaction.user}\nCash Balance: ${userBalances.user_balance_cash.toLocaleString()} ${globals.cashEmoji}\nBank Balance: ${userBalances.user_balance_bank.toLocaleString()} ${globals.BankEmoji}\n\n`);
      }
    } catch (error) {
      console.error(error);
      // Handle the error appropriately, e.g., send an error message to the user.
      await interaction.editReply('An error occurred while fetching the balance.');
    }
  },
};
