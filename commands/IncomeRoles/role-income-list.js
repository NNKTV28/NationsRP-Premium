const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const BalanceIncomeRole = require('../../models/balanceIncomeRole');
const ItemIncomeRole = require('../../models/itemIncomeRole');
const embedColors = require('../../utils/colors.js');
const UserSettingsModel = require("../../models/usersettings.js");

const formatCooldown = (input) => {
  let value = Number(input);
  if (Number.isNaN(value) && typeof input === 'string') {
    const parts = input.split(':').map(Number);
    if (parts.length === 3 && parts.every((p) => !Number.isNaN(p))) {
      value = parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
  }

  if (Number.isNaN(value) || value < 0) {
    value = 0;
  }

  const hrs = Math.floor(value / 3600).toString().padStart(2, '0');
  const mins = Math.floor((value % 3600) / 60).toString().padStart(2, '0');
  const secs = Math.floor(value % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role-income-list')
    .setDescription('Lists configured balance and item income roles for this guild.')
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('Choose which income type to display')
        .addChoices(
          { name: 'All', value: 'all' },
          { name: 'Balance', value: 'balance' },
          { name: 'Item', value: 'item' },
        )
        .setRequired(false)
    )
    .setDMPermission(false),

  async execute(interaction) {
    const userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
    await interaction.deferReply({ ephemeral: userRecord?.ephemeral_message });

    const guildId = interaction.guild.id;
    const selection = interaction.options.getString('type') || 'all';

    const embed = new EmbedBuilder()
      .setTitle('- Role Income List -')
      .setColor(embedColors.GENERAL_COLORS.GREEN);

    let hasData = false;

    if (selection === 'all' || selection === 'balance') {
      const balanceRoles = await BalanceIncomeRole.findAll({ where: { guild_id: guildId } });
      if (balanceRoles.length > 0) {
        hasData = true;
        const description = balanceRoles
          .map((role) => `• <@&${role.role_id}> → $${Number(role.amount_to_recieve).toLocaleString()} every ${formatCooldown(role.cooldown_timer)}`)
          .join('\n');
        embed.addFields({ name: 'Balance Roles', value: description });
      } else if (selection !== 'item') {
        embed.addFields({ name: 'Balance Roles', value: 'No balance income roles configured.' });
      }
    }

    if (selection === 'all' || selection === 'item') {
      const itemRoles = await ItemIncomeRole.findAll({ where: { guild_id: guildId } });
      if (itemRoles.length > 0) {
        hasData = true;
        const description = itemRoles
          .map((role) => `• <@&${role.role_id}> → ${role.item_to_recieve} x ${Number(role.amount_to_recieve)} every ${formatCooldown(role.cooldown_timer)}`)
          .join('\n');
        embed.addFields({ name: 'Item Roles', value: description });
      } else if (selection !== 'balance') {
        embed.addFields({ name: 'Item Roles', value: 'No item income roles configured.' });
      }
    }

    if (!hasData) {
      embed.setColor(embedColors.GENERAL_COLORS.RED);
    }

    return interaction.editReply({ embeds: [embed] });
  },
};
