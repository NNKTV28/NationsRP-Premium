const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Store = require('../../models/store');
const globals = require("../../utils/globals.js");
const Inventory = require('../../models/inventory');
const UserSettingsModel = require("../../models/usersettings.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("give-user-item")
    .setDescription("Give an item to a user.")
    .addUserOption(option => option
        .setName('user')
        .setDescription('The user you want to give the item to.')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('item')
        .setDescription('The item you want to give.')
        .setRequired(true)
    )
    .addIntegerOption(option => option
        .setName('amount')
        .setDescription('The amount of the item you want to give.')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
    await interaction.deferReply({ ephemeral: userRecord?.ephemeral_message });

    const user = interaction.options.getUser('user');
    const itemName = interaction.options.getString('item');
    const amount = interaction.options.getInteger('amount'); // Corrected variable name from 'ammount' to 'amount'

    try {
      // Check if the item exists in the shop
      const existingItem = await Store.findOne({
        where: { itemName: itemName },
      });

      if (!existingItem) {
        console.log("Item does not exist in the shop.");
        return interaction.editReply(`Item "${itemName}" does not exist in the shop.`);
      } else {
        // Create or update the user's inventory for the purchased item
        let userInventory = await Inventory.findOne({
          where: { user_id: user.id, item_Name: itemName },
        });

        const roleToUse = existingItem.role_to_use || interaction.guild.id;

        if (!userInventory) {
          console.log("!userInventory works.");
          // If the item is not in the inventory, create a new entry
          userInventory = await Inventory.create({
            user_id: user.id,
            item_Name: itemName,
            item_Amount: amount,
            role_to_use: roleToUse,
          });
          console.log(`Created an inventory entry for ${user.tag}`);
        } else {
          // If the item is already in the inventory, increment the amount
          userInventory.item_Amount += amount;
          userInventory.role_to_use = roleToUse;
          await userInventory.save();
        }
        interaction.editReply(`Item "${itemName}" has been given to ${user.tag} ${amount} times.`);
      }
    } catch (err) {
      console.error(err);
      globals.sendWebhookError(err);
      interaction.editReply('An err occurred while processing your request.');
    }
  }
};
