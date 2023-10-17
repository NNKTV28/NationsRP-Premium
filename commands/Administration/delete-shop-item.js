const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Store = require('../../models/store');
const globals = require("../../utils/globals.js");
const UserSettingsModel = require("../../models/usersettings.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("delete-shop-item")
    .setDescription("Remove an item from the shop.")
    .addStringOption(itemOption => itemOption
        .setName('item')
        .setDescription('The item you want to remove from the shop')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction) {
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
    await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });

    const itemName = interaction.options.getString('item');

    try {
      // Check if the item exists in the shop
      const item = await Store.findOne({
        where: { itemName: itemName },
      });

      if (!item) {
        interaction.editReply(`Item "${itemName}" does not exist in the shop.`);
      } else {
        await item.destroy();
        interaction.editReply(`Item "${itemName}" has been removed from the shop.`);
      }
    } catch (err) {
      console.log(err);
      globals.sendWebhookError(err);
    }
  },
};
