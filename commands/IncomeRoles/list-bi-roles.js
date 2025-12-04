const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const balanceIncomeList = require('../../models/balanceIncomeRole');
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
    .setName("list-bi-roles")
    .setDescription("View items available in the shop.")
    .setDMPermission(false),

  async execute(interaction) {
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
    await interaction.deferReply({ ephemeral: userRecord?.ephemeral_message });

    const balanceRoles = await balanceIncomeList.findAll({
      where: { guild_id: interaction.guild.id },
    });

    try {
      const redeemEmbed = new EmbedBuilder()
        .setTitle('  - Balance Income Roles -  ')
        .setColor(`${colors.GENERAL_COLORS.GREEN}`);
      if (balanceRoles.length === 0) {
        return interaction.editReply('There are no balance income roles yet.');
      }

      for (const role of balanceRoles) {
        const cooldownFormatted = formatCooldown(role.cooldown_timer);
        redeemEmbed.addFields({
          name: `<@&${role.role_id}>`,
          value: `Amount: $${Number(role.amount_to_recieve).toLocaleString()}\nCooldown: ${cooldownFormatted}`,
        });
      }

      return interaction.editReply({ embeds: [redeemEmbed] });
    } catch (err) {
      console.error(err);
      interaction.editReply('An err occurred while fetching the income items.');
    }
  },
};
