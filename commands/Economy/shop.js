const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, embedLength } = require('discord.js');
const Store = require('../../models/store');
const Balance = require('../../models/balance');
const globals = require("../../utils/globals.js");
const config = require("../../config.json");
const Guild = require('../../models/guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("View items available in the shop.")
    .setDMPermission(false),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const user = interaction.user; // Get the user from the interaction
    let embedColor = Guild.EmbedColor

    try {

      const items = await Store.findAll({
        attributes: ['itemName', 'itemPrice', 'itemDescription', 'itemQuantity'],
      });

      if(!Guild.EmbedColor){
        embedColor = "Aqua"
      }

      if (!items || items.length === 0) {
        const noItemsEmbed = new EmbedBuilder()
          .setTitle('  - Shop -  ')
          .setDescription('There are no items in the shop.');
        return interaction.editReply({ embeds: [noItemsEmbed] });
      } else {
        const itemsListEmbed = new EmbedBuilder()
          .setTitle('  - Shop -  ')
          .setColor(`${embedColor}`)

        for (const item of items) {
          const userBalance = await Balance.findOne({
            where: { user_id: user.id },
          });

          let Unlimited = item.itemQuantity;
          if(Unlimited == null){
            Unlimited = "Unlimited"
          }else{
            Unlimited = item.itemQuantity
          }

          if (userBalance && userBalance.user_balance_cash >= item.itemPrice) {
            itemsListEmbed.addFields(
              { name: `${item.itemName} - ${item.itemPrice.toLocaleString()}$ - Available: ${Unlimited} - ${globals.Yes}`, value: ` ${item.itemDescription}`},
            );
          } else {            
            itemsListEmbed.addFields(
              { name: `${item.itemName} - ${item.itemPrice.toLocaleString()}$ - Available: ${Unlimited} - ${globals.No}`, value: ` ${item.itemDescription}`},
            );
          }
        }
        return interaction.editReply({ embeds: [itemsListEmbed] });
      }
    } catch (error) {
      console.error(error);
      interaction.editReply('There was an error while getting the shop items.');
    }
  },
};