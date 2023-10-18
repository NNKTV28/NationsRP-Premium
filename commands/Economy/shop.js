const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, embedLength } = require('discord.js');
const Store = require('../../models/store');
const Balance = require('../../models/balance');
const globals = require("../../utils/globals.js");
const config = require("../../config.json");
const GuildModel = require('../../models/guild');
const UserSettingsModel = require("../../models/usersettings.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("View items available in the shop.")
    .setDMPermission(false),

  async execute(interaction) {
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });

    await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });
    const user = interaction.user;
    try {
      const items = await Store.findAll({
        attributes: ['itemName', 'itemPrice', 'itemDescription', 'itemQuantity'],
      });

      if (!items || items.length === 0) {
        const noItemsEmbed = new EmbedBuilder()
          .setTitle('  - Shop -  ')
          .setDescription('There are no items in the shop.');
        return interaction.editReply({ embeds: [noItemsEmbed] });
      } else {
        const itemsListEmbed = new EmbedBuilder()
          .setTitle('  - Shop -  ')
          .setColor(`${userRecord.embed_color}`)

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
      console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[SHOP ERROR]`)} ` + `${error}`.bgRed);
      interaction.editReply('There was an error while getting the shop items.');
    }
  },
};