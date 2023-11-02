const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const itemIncomeRole = require('../../models/itemIncomeRole');
const InventoryModel = require('../../models/inventory');
const StoreModel = require('../../models/store');
const UserSettingsModel = require("../../models/usersettings.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add-item-income-role')
    .setDescription('Create an item income role.')
    .addStringOption(option =>
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

    await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });

    const roleID = interaction.options.getString('role_id');
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
      const item = await StoreModel.findOne({ name: itemName });
      if (!item) {
        return interaction.editReply('The item name is invalid. The name must be an exact match in the store.');
      }

      // Check if the amount to receive is valid
      const amount = parseInt(amountToReceive, 10);
      if (amount <= 0) {
        return interaction.editReply('The amount to receive must be a positive number.');
      }

      // Check if the timer to receive is valid
      const timer = timerToReceive.split(':');
      if (timer.length !== 3) {
        return interaction.editReply('The timer to receive is invalid.');
      }

      // Check if the role already has an item role
      const itemRole = await itemIncomeRole.findOne({ role_id: roleID });
      if (itemRole) {
        return interaction.editReply(`The role already has an item asigned`);
      }

      // Create an income role entry in the database
      await itemIncomeRole.create({
        role_id: roleID,
        item_to_recieve: itemName,
        ammount_to_recieve: amountToReceive,
        timer_to_recieve: timerToReceive,
      });

      interaction.editReply(`Item role created for role ID: ${roleID}`);
    } catch (err) {
      console.error(err);
      interaction.editReply('An err occurred while creating the income role.');
    }
  },
};
