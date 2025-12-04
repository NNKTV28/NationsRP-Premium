const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Inventory = require('../../models/inventory');
const UserSettingsModel = require("../../models/usersettings.js");
const embedColors = require('../../utils/colors.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('use')
    .setDescription('View your inventory.')
    .addStringOption(option => option
        .setName('item')
        .setDescription('The item you want to use')
        .setRequired(true)
      )
      .addIntegerOption(option => option
        .setName('amount')
        .setDescription('The amount of the item you want to use')
        .setRequired(true)
      )
    .setDMPermission(false),

  async execute(interaction) {
    const userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
    await interaction.deferReply({ ephemeral: userRecord?.ephemeral_message });

    try {
      const userId = interaction.user.id;
      const member = await interaction.guild.members.fetch(userId);
      const itemName = interaction.options.getString("item");
      const amount = interaction.options.getInteger("amount");

      if (!Number.isInteger(amount) || amount <= 0) {
        return interaction.editReply('Amount must be a positive integer.');
      }

      const inventoryItem = await Inventory.findOne({
        where: { user_id: userId, item_Name: itemName },
      });

      if (!inventoryItem || inventoryItem.item_Amount < amount) {
        return interaction.editReply("You don't have enough of that item in your inventory.");
      }

      const roleToGrant = inventoryItem.role_to_use;
      let roleGranted = null;

      if (roleToGrant && roleToGrant !== interaction.guild.id) {
        const role = interaction.guild.roles.cache.get(roleToGrant);
        if (!role) {
          return interaction.editReply('The role linked to this item no longer exists. Please contact an admin.');
        }

        if (member.roles.cache.has(role.id)) {
          roleGranted = 'already-owned';
        } else {
          await member.roles.add(role);
          roleGranted = role;
        }
      }

      const previousAmount = inventoryItem.item_Amount;
      inventoryItem.item_Amount -= amount;
      const newAmount = Math.max(inventoryItem.item_Amount, 0);
      if (inventoryItem.item_Amount <= 0) {
        await inventoryItem.destroy();
      } else {
        await inventoryItem.save();
      }

      const successEmbed = new EmbedBuilder()
        .setColor(embedColors.GENERAL_COLORS.GREEN)
        .setTitle('Item Used')
        .setDescription(`You used ${amount}x ${itemName}.`)
        .addFields({
          name: 'Inventory',
          value: `${previousAmount} → ${newAmount}`,
        });

      if (roleGranted && roleGranted !== 'already-owned') {
        successEmbed.addFields({ name: 'Role Granted', value: `${roleGranted}` });
      } else if (roleGranted === 'already-owned') {
        successEmbed.addFields({ name: 'Role Update', value: 'You already had this role. Item was still consumed.' });
      }

      await interaction.editReply({ embeds: [successEmbed] });
    } catch (err) {
      console.error('[USE ERROR]', err);
      const errorEmbed = new EmbedBuilder()
        .setColor(`${embedColors.GENERAL_COLORS.RED}`)
        .setTitle("Use Error")
        .setDescription("An err occurred while executing the /use command.")
        .addFields({ name: "Error:", value: `${err}` });
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
