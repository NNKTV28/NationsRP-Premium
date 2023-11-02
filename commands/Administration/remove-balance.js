const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const BalanceModel = require('../../models/balance');
const globals = require("../../utils/globals.js");
const UserSettingsModel = require("../../models/usersettings.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove-balance")
    .setDescription("Add money to a specific user's balance.")
    .addUserOption(option => option
      .setName('user')
      .setDescription('The user to add money to')
      .setRequired(true)
    )
    .addIntegerOption(option => option
      .setName('amount')
      .setDescription('The amount to remove')
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
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
    await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });
    let addingNew = false; // Use let instead of const for reassignment

    try {
      const targetUser = interaction.options.getMember('user');
      const amount = interaction.options.getInteger('amount');
      const removeCash = interaction.options.getBoolean('cash');
      const removeBank = interaction.options.getBoolean('bank');

      if (!removeCash && !removeBank) {
        return interaction.editReply('Please specify whether to remove to cash balance, bank balance, or both.');
      }

      if (!targetUser || amount <= 0) {
        return interaction.editReply('Please provide a valid user and a positive amount to remove.');
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
        interaction.editReply(`User had no balance in the database so his new balance was set to 0. Balance set to the user: ${targetUser.displayName} Amount: 0${globals.coinEmoji}.`);
      } else {
        if (removeCash) {
          if(amount > userBalances.user_balance_cash)
          {
            interaction.editReply(`The amount introduced is greater than the amount cash balance. His current amount is ${userBalances.user_balance_cash}`);

          }else{
            userBalances.user_balance_cash -= amount;
          }
        }
        if (removeBank) {
          if(amount > userBalances.user_balance_bank)
          {
            return interaction.editReply(`The amount introduced is greater than the amount bank balance. His current amount is ${userBalances.user_balance_bank}`);
          }else{
            userBalances.user_balance_bank -= amount;
          }
        }
        await userBalances.save();
        interaction.editReply(`Succesfully removed **${amount}**${globals.coinEmoji} to **${targetUser.displayName}'s** balance.`);
      }
    } catch (err) {
      console.error(err);
      await interaction.editReply('An err occurred while adding balance.');
    }
  },
};
