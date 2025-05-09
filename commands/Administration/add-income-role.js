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

    await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });

    const roleID = interaction.options.getRole('role_id').id;
    const amountToReceive = interaction.options.getString('amount_to_receive');
    const timerToReceive = interaction.options.getString('timer_to_receive');

    try {
      console.log(roleID);
      // Check that timer to receive format is HH:MM:SS
      const timerRegex = /^[0-2]?[0-4]:[0-5][0-9]:[0-5][0-9]$/; // Modified regex

      if (!timerToReceive.match(timerRegex)) {
        await interaction.editReply('Invalid timer to receive format. Format must be HH:MM:SS');
        return console.log('Invalid timer to receive format. Format must be HH:MM:SS');
      }

      const incomeRole = await BalanceIncomeRole.findOne({ where: { guild_id: interaction.guild.id, role_id: roleID } });
      if (incomeRole) {
        await interaction.editReply('Income role already exists for this role ID.');
      }
      // pass timerToRecieve to secconds
      const timerToReceiveSeconds = timerToReceive.split(':').reduce((acc, curr) => acc * 60 + curr);
      console.log(timerToReceiveSeconds);

      if (timerToReceiveSeconds < 60) {
        await interaction.editReply('Timer to receive must be at least 1 minute.');
        return console.log('Timer to receive must be at least 1 minute.');
      }
      // Create an income role entry in the database
      await BalanceIncomeRole.create({
        guild_id: interaction.guild.id,
        role_id: roleID,
        amount_to_recieve: amountToReceive,
        cooldown_timer: timerToReceiveSeconds,
      });
      interaction.editReply(`Income role created for role ID: ${roleID}`);
    } catch (err) {
      console.error(err);
      interaction.editReply('An err occurred while creating the income role.');
    }
  },
};
