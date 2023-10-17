const { SlashCommandBuilder } = require('discord.js');
const Inventory = require('../../models/inventory'); // Import your Inventory model
const UserSettingsModel = require("../../models/usersettings.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('view-inventory')
    .setDescription('View your inventory.')
    .setDMPermission(false),

  async execute(interaction) {
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
    await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });

    try {
      const userId = interaction.user.id;

      // Find the user's inventory items
      const inventoryItems = await Inventory.findAll({
        where: { user_id: userId },
        attributes: ['item_Name', 'item_Amount'],
      });

      if (!inventoryItems || inventoryItems.length === 0) {
        return interaction.editReply('Your inventory is empty.');
      } else {
        let reply = 'Your Inventory:\n\n';

        for (const item of inventoryItems) {
          reply += `**${item.item_Name}**: ${item.item_Amount}\n`;
        }

        return interaction.editReply(reply);
      }
    } catch (error) {
      console.error(error);
      interaction.editReply('An error occurred while fetching your inventory.');
    }
  },
};
