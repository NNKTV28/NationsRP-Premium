const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const BalanceModel = require('../../models/balance');
const globals = require("../../utils/globals.js");
const embedColor = require("../../utils/colors.js");
const UserSettingsModel = require("../../models/usersettings.js");
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
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });

    await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });

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

      const addedBalanceEmbed = new EmbedBuilder()
        .setColor(`${embedColor.GENERAL_COLORS.GREEN}`)
        .setTitle("Added Balance")
      
        if (addToCash) {
          userBalances.user_balance_cash += amount;
          addedBalanceEmbed.addFields({ name: `Added cash money to ${targetUser.displayName}:`, value: `${amount}${globals.cashEmoji}` });
        }
        if (addToBank) {
          userBalances.user_balance_bank += amount;
          addedBalanceEmbed.addFields({ name: `Added bank money to ${targetUser.displayName}:`, value: `${amount}${globals.BankEmoji}` });
        }
        await userBalances.save();
        
        return interaction.editReply({ embeds: [addedBalanceEmbed] });
    } catch (err) {
      console.error(err);
      const errorEmbed = new EmbedBuilder()
        .setColor(`${globals.embedColors.GENERAL_COLORS.RED}`)
        .setTitle("Add Balance Error")
        .setDescription("An error occurred while executing the /add-balance command.")
        .addFields({ name: "Error:", value: `${err}`});
      return interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
