const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const itemIncomeRole = require('../../models/itemIncomeRole');
const colors = require("../../utils/colors.js");
const UserSettingsModel = require("../../models/usersettings.js");

const formatCooldown = (value) => {
  let seconds = Number(value);
  if (Number.isNaN(seconds) && typeof value === 'string') {
    const parts = value.split(':').map(Number);
    if (parts.length === 3 && parts.every((p) => !Number.isNaN(p))) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
  }

  if (Number.isNaN(seconds) || seconds < 0) {
    seconds = 0;
  }

  const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("list-ii-roles")
    .setDescription("View items available in the shop.")
    .setDMPermission(false),

  async execute(interaction) {
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
    await interaction.deferReply({ ephemeral: userRecord?.ephemeral_message });
    
    const itemIncomeRoles = await itemIncomeRole.findAll({ where: { guild_id: interaction.guild.id } });
    try {

      if (itemIncomeRoles.length === 0) {
        return interaction.editReply('There are no item income roles yet.');
      }

      const replyEmbed = new EmbedBuilder()
        .setColor(colors.GENERAL_COLORS.GREEN)
        .setTitle('- Item Income Roles -');

      for (const role of itemIncomeRoles) {
        const cooldownFormatted = formatCooldown(role.cooldown_timer);
        replyEmbed.addFields({
          name: `<@&${role.role_id}> -> ${role.item_to_recieve}`,
          value: `Amount: ${Number(role.amount_to_recieve)}\nCooldown: ${cooldownFormatted}`,
        });
      }

      return interaction.editReply({ embeds: [replyEmbed] });
    } catch (err) {
      console.error(err);
      interaction.editReply('An err occurred while fetching the income items.');
    }
  },
};
