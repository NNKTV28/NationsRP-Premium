const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const BalanceIncomeRole = require('../../models/balanceIncomeRole');
const UserSettingsModel = require("../../models/usersettings.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add-income-role')
    .setDescription('Create an income role.')
    .addRoleOption(option =>
      option.setName('role_id')
        .setDescription('The role ID')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('amount_to_receive')
        .setDescription('The amount to receive')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('timer_to_receive')
        .setDescription('The timer to receive (in HH:MM:SS format)')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });

    await interaction.deferReply({ ephemeral: userRecord?.ephemeral_message });

    const roleID = interaction.options.getRole('role_id').id;
    const amountToReceive = interaction.options.getString('amount_to_receive');
    const timerToReceive = interaction.options.getString('timer_to_receive');

    try {
      const timerRegex = /^(\d{1,2}):(\d{2}):(\d{2})$/;
      if (!timerRegex.test(timerToReceive)) {
        return interaction.editReply('Invalid timer format. Use HH:MM:SS');
      }

      const [hours, minutes, seconds] = timerToReceive.split(':').map(Number);
      const timerToReceiveSeconds = hours * 3600 + minutes * 60 + seconds;
      if (timerToReceiveSeconds < 60) {
        return interaction.editReply('Timer to receive must be at least 1 minute.');
      }

      const parsedAmount = Number(amountToReceive);
      if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
        return interaction.editReply('Amount to receive must be a positive number.');
      }

      const existingRole = await BalanceIncomeRole.findOne({ where: { guild_id: interaction.guild.id, role_id: roleID } });
      if (existingRole) {
        return interaction.editReply('Income role already exists for this role ID.');
      }

      await BalanceIncomeRole.create({
        guild_id: interaction.guild.id,
        role_id: roleID,
        amount_to_recieve: parsedAmount,
        cooldown_timer: timerToReceiveSeconds,
      });

      interaction.editReply(`Income role created for role ID: ${roleID}`);
    } catch (err) {
      console.error(err);
      interaction.editReply('An err occurred while creating the income role.');
    }
  },
};
