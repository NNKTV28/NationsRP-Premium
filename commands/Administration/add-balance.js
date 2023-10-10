const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const BalanceModel = require('../../models/balance');
const globals = require("../../utils/globals.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-balance")
    .setDescription("Add money to a specific user's balance.")
    .addUserOption(option => option
      .setName('user')
      .setDescription('The user to add money to')
      .setRequired(true)
    )
    .addIntegerOption(option => option
      .setName('amount')
      .setDescription('The amount to add')
      .setRequired(true)
    )
    .addBooleanOption(option => option
      .setName('cash')
      .setDescription('Add to cash balance')
      .setRequired(false)
    )
    .addBooleanOption(option => option
      .setName('bank')
      .setDescription('Add to bank balance')
      .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    let addingNew = false; // Use let instead of const for reassignment

    try {
      const targetUser = interaction.options.getMember('user');
      const amount = interaction.options.getInteger('amount');
      const addToCash = interaction.options.getBoolean('cash');
      const addToBank = interaction.options.getBoolean('bank');

      if (!addToCash && !addToBank) {
        return interaction.editReply('Please specify whether to add to cash balance, bank balance, or both.');
      }

      if (!targetUser || amount <= 0) {
        return interaction.editReply('Please provide a valid user and a positive amount to add.');
      }

      let userBalances = await BalanceModel.findOne({
        where: { user_id: targetUser.id },
      });

      if (!userBalances) {
        addingNew = true;
        userBalances = await BalanceModel.create({
          user_id: targetUser.id,
          user_balance_cash: 0, // Set initial cash balance to 0
          user_balance_bank: 0, // Set initial bank balance to 0
        });
      }

      if (addingNew) {
        if (addToCash) {
          userBalances.user_balance_cash += amount;
        }
        if (addToBank) {
          userBalances.user_balance_bank += amount;
        }
        await userBalances.save();
        
        interaction.editReply(`Balance added to the user: ${targetUser.displayName} Amount: ${amount}${globals.coinEmoji}.`);
      } else {
        if (addToCash) {
          userBalances.user_balance_cash += amount;
        }
        if (addToBank) {
          userBalances.user_balance_bank += amount;
        }
        await userBalances.save();
        interaction.editReply(`Added **${amount}**${globals.coinEmoji} to **${targetUser.displayName}'s** balance.`);
      }
    } catch (error) {
      console.error(error);
      await interaction.editReply('An error occurred while adding balance.');
    }
  },
};
