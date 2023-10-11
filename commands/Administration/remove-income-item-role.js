const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const itemIncomeRole = require('../../models/itemIncomeRole');

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
    await interaction.deferReply({ ephemeral: true });

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
    } catch (error) {
      console.error(error);
      interaction.editReply('An error occurred while removing the item-income.');
    }
  },
};