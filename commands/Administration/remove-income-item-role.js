const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const itemIncomeRole = require('../../models/itemIncomeRole');
const UserSettingsModel = require("../../models/usersettings.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove-income-item-role')
    .setDescription('Remove an item-income from the database.')
    .addStringOption(option =>
      option.setName('role_id')
        .setDescription('The role ID')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
    await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });

    const roleID = interaction.options.getString('role_id');

    try {
      // Check if the role ID is valid
      const itemRole = await itemIncomeRole.findOne({ role_id: roleID });
      if (!itemRole) {
        return interaction.editReply('The role does not have an item assigned.');
      }
      const deleteItemRole = await itemIncomeRole.findOne({
        where: { role_id: roleID },
      });
      await deleteItemRole.destroy();

      interaction.editReply(`Item-income removed for role ID: ${roleID}`);
    } catch (err) {
      console.error(err);
      interaction.editReply('An err occurred while removing the item-income.');
    }
  },
};