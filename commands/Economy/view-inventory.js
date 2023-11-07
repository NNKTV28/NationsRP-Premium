const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Inventory = require('../../models/inventory.js'); // Import your Inventory model
const UserSettingsModel = require("../../models/usersettings.js");
const embedColors = require('../../utils/colors.js');
const color = require("colors");
const moment = require("moment");

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
    } catch (err) {
      console.error(err);
      const errorEmbed = new EmbedBuilder()
        .setColor(`${embedColors.GENERAL_COLORS.RED}`)
        .setTitle("/inventory Error")
        .setDescription("An error occurred while executing the /inventoy command.")
        .addFields({ name: "Error:", value: `${err}` });
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
