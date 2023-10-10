const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const balanceIncomeList = require('../../models/balanceIncomeRole');
const globals = require("../../utils/globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("list-bi-roles")
    .setDescription("View items available in the shop.")
    .setDMPermission(false),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const balanceRoles = await balanceIncomeList.findAll({
      attributes: ['role_id', 'ammount_to_recieve', 'timer_to_recieve']
    });

    try {
      if (!balanceRoles) {
        return interaction.editReply('There are no item roles yet.');
      } else {
        let reply = 'Balance roles:\n\n';

        for (const role of balanceRoles) 
        {
            reply += `**${role.role_id}** - ${role.ammount_to_recieve}$ - ${role.timer_to_recieve}h\n`;
        }
        return interaction.editReply(reply);
      }
    } catch (error) {
      console.error(error);
      interaction.editReply('An error occurred while fetching the income items.');
    }
  },
};
