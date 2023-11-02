const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const BlackMarketModel = require('../../models/blackMarket');
const Balance = require('../../models/balance');
const globals = require('../../utils/globals');
const UserSettingsModel = require("../../models/usersettings.js");
const embedColors = require('../../utils/colors.js');
const color = require("colors");
const moment = require("moment");


module.exports = {
  data: new SlashCommandBuilder()
    .setName("black-market")
    .setDescription("View items available in the shop.")
    .setDMPermission(false),

  async execute(interaction) {
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
    await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });

    const user = interaction.user; // Get the user from the interaction

    try {
      const items = await BlackMarketModel.findAll({
        attributes: ['seller_id', 'itemName', 'itemPrice', 'itemDescription', 'itemCuantity']
      });

      if (!items || items.length === 0) {
        const noItemsEmbed = new EmbedBuilder()
          .setTitle('  - Black Market (Dont get caught ;) ) -  ')
          .setDescription('There are no items in listed yet.');
        return interaction.editReply({ embeds: [noItemsEmbed] });
      } else {
        const itemsListEmbed = new EmbedBuilder()
          .setTitle('Black Market (Dont get caught ;) )')
          .addFields(
            { name: 'Item Seller -', value: '\u200B', inline: true},
            { name: 'Item Price -', value: '\u200B', inline: true},
            { name: 'Item Description -', value: '\u200B', inline: true},
          )

        for (const item of items) {
          const userBalance = await Balance.findOne({
            where: { user_id: user.id },
          });

          // If a user has a cop role or security role then dont allow them to see the seller_id


          if (userBalance && userBalance.user_balance_cash >= item.itemPrice) {
            itemsListEmbed.addFields(
              { name: `${item.seller_id}`, value: `${item.itemName}`, inline: true},
              { name: '\u200B', value:  `${item.itemPrice}$ `, inline: true},
              { name: '\u200B', value: `${item.itemDescription} - ${globals.Yes}`, inline: true},
            );
          } else {
            itemsListEmbed.addFields(
              { name: 'Item Name', value: item.itemName,},
              { name: 'Price:', value:  `${item.itemPrice}$ `},
              { name: 'Description', value: `${item.itemDescription} - ${globals.No}`},
            );
          }
        }

        return interaction.editReply({ embeds: [itemsListEmbed] });
      }
    } catch (err) {
      console.error(err);
      
      interaction.editReply('There was an err while getting the shop items.');
    }
  },
};