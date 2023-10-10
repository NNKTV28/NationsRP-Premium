const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const itemIncomeRole = require('../../models/itemIncomeRole');
const globals = require("../../utils/globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("list-ii-roles")
    .setDescription("View items available in the shop.")
    .setDMPermission(false),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const itemIncomeRoles = await itemIncomeRole.findAll();
    const user = interaction.user; // Get the user from the interaction
    try {

      if (!itemIncomeRoles) {
        return interaction.editReply('There are no item roles yet.');
      } else {
        let reply = 'Item roles:\n\n';

        for (const role of itemIncomeRoles) 
        {
            reply += `**${role.role_id}** - ${role.item_to_recieve} - ${role.ammount_to_recieve} - ${role.timer_to_recieve}h`;
        }
        return interaction.editReply(reply);
      }
    } catch (error) {
      console.error(error);
      interaction.editReply('An error occurred while fetching the income items.');
    }
  },
};
