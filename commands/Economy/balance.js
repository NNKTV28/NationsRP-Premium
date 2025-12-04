const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const BalanceModel = require('../../models/balance');
const globals = require("../../utils/globals.js");
const UserSettingsModel = require("../../models/usersettings.js");
const embedColors = require('../../utils/colors.js');

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
    await interaction.deferReply({ ephemeral: userRecord?.ephemeral_message });

    try {
      const targetMember = interaction.options.getMember('user') || interaction.member;
      const targetId = targetMember.id;

      const [userBalances] = await BalanceModel.findOrCreate({
        where: { guild_id: interaction.guild.id, user_id: targetId },
        defaults: {
          user_balance_cash: 0,
          user_balance_bank: 0,
        },
      });

      const responseEmbed = new EmbedBuilder()
        .setColor(embedColors.GENERAL_COLORS.GREEN)
        .setTitle(`${targetMember.displayName || targetMember.user?.username || 'User'}'s Balance`)
        .setDescription(
          `Cash: ${userBalances.user_balance_cash.toLocaleString()} ${globals.cashEmoji}\n` +
          `Bank: ${userBalances.user_balance_bank.toLocaleString()} ${globals.BankEmoji}`
        );

      await interaction.editReply({ embeds: [responseEmbed] });
    } catch (err) {
      console.error(err);
      // Handle the err appropriately, e.g., send an err message to the user.
      const errorEmbed = new EmbedBuilder()
      .setColor(`${embedColors.GENERAL_COLORS.RED}`)
        .setTitle("/Balance Error")
        .setDescription("An err occurred while executing the /balance command.")
        .addFields({ name: "Error:", value: `${err}` });
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
