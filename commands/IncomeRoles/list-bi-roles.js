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
          const timerToReceive = role.timer_to_recieve;
          const timerToReceiveSeconds = timerToReceive.split(':').reduce((acc, curr) => acc * 60 + +curr);
          reply += `**${role.role_id}** - ${role.ammount_to_recieve}$ - ${timerToReceiveSeconds}h\n`;
        }
        return interaction.editReply(reply);
      }
    } catch (error) {
      console.error(error);
      interaction.editReply('An error occurred while fetching the income items.');
    }
  },
};
