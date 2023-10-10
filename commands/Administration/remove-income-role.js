const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const BalanceIncomeRole = require('../../models/balanceIncomeRole');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove-income-role')
    .setDescription('Delete the income role.')
    .addRoleOption(option =>
      option.setName('role_id')
        .setDescription('The role ID')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const roleID = interaction.options.getRole('role_id').id;

    try {
      // Find and delete the income role entry in the database
      //const deletedRole = await BalanceIncomeRole.findOneAndDelete({ role_id: roleID });
      const deletedRole = await BalanceIncomeRole.findOne({
        where: { role_id: roleID },
      });
      await deletedRole.destroy(deletedRole);

      if (deletedRole) {
        interaction.editReply(`Income role deleted for role ID: ${roleID}`);
      } else {
        interaction.editReply(`Income role with role ID ${roleID} not found.`);
      }
    } catch (error) {
      console.error(error);
      interaction.editReply('An error occurred while deleting the income role.');
    }
  },
};