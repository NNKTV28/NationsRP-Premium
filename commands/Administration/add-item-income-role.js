const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const itemIncomeRole = require('../../models/itemIncomeRole');
const InventoryModel = require('../../models/inventory');
const StoreModel = require('../../models/store');
const UserSettingsModel = require("../../models/usersettings.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add-item-income-role')
    .setDescription('Create an item income role.')
    .addRoleOption(option =>
      option.setName('role_id')
        .setDescription('The role ID')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('item_name')
        .setDescription('The amount to receive')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('amount_to_receive')
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

    await interaction.deferReply({ ephemeral: userRecord?.ephemeral_message });

    const roleID = interaction.options.getRole('role_id').id;
    const itemName = interaction.options.getString('item_name');
    const amountToReceive = interaction.options.getString('amount_to_receive');
    const timerToReceive = interaction.options.getString('timer_to_receive');

    try {
        // Check if the role ID is valid
      const role = interaction.guild.roles.cache.get(roleID);
      if (!role) {
        return interaction.editReply('The role ID is invalid.');
      }

      // Check if the item name is valid
      const item = await StoreModel.findOne({ where: { itemName } });
      if (!item) {
        return interaction.editReply('The item name is invalid. The name must be an exact match in the store.');
      }

      // Check if the amount to receive is valid
      const amount = Number(amountToReceive);
      if (Number.isNaN(amount) || amount <= 0) {
        return interaction.editReply('The amount to receive must be a positive number.');
      }

      // Check if the timer to receive is valid
      const timerParts = timerToReceive.split(':').map(Number);
      if (timerParts.length !== 3 || timerParts.some((part) => Number.isNaN(part))) {
        return interaction.editReply('The timer to receive is invalid. Use HH:MM:SS format.');
      }
      const timerSeconds = timerParts[0] * 3600 + timerParts[1] * 60 + timerParts[2];
      if (timerSeconds < 60) {
        return interaction.editReply('Timer to receive must be at least 1 minute.');
      }

      // Check if the role already has an item role
      const itemRole = await itemIncomeRole.findOne({ where: { guild_id: interaction.guild.id, role_id: roleID } });
      if (itemRole) {
        return interaction.editReply(`The role already has an item asigned`);
      }

      // Create an income role entry in the database
      await itemIncomeRole.create({
        guild_id: interaction.guild.id,
        role_id: roleID,
        item_to_recieve: itemName,
        amount_to_recieve: amount,
        cooldown_timer: timerSeconds,
      });

      interaction.editReply(`Item role created for role ID: ${roleID}`);
    } catch (err) {
      console.error(err);
      interaction.editReply('An err occurred while creating the income role.');
    }
  },
};
