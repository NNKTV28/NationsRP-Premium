const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, embedLength } = require('discord.js');
const color = require("colors")
const moment = require("moment");

const Store = require('../../models/store');
const Balance = require('../../models/balance');
const globals = require("../../utils/globals.js");
const config = require("../../config.json");
const GuildModel = require('../../models/guild');
const UserSettingsModel = require("../../models/usersettings.js");
const embedColors = require('../../utils/colors.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("View items available in the shop.")
    .addStringOption((option) =>
      option
      .setName("item")
      .setDescription("Info about the specifyed item")
      .setRequired(false)
    )

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
        if(interaction.options.getString("item")){
          const item = await Store.findOne({
            where: { itemName: interaction.options.getString("item") },
          });
          if(!item){
            return interaction.editReply("That item doesnt exist.")
          }
          const userBalance = await Balance.findOne({
            where: { user_id: user.id },
          });
          if(userBalance && userBalance.user_balance_cash >= item.itemPrice){
            return interaction.editReply(`You can afford this item.`)
          }else{
            return interaction.editReply(`You cant afford this item.`)
          }
        }
        const itemsListEmbed = new EmbedBuilder()
          .setTitle('  - Shop -  ')
          .setColor(`${embedColors.GENERAL_COLORS.GREEN}`)

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
    } catch (err) {
      console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[SHOP ERROR]`)} ` + `${err}`.bgRed);
      const errorEmbed = new EmbedBuilder()
      .setColor(`${embedColors.GENERAL_COLORS.RED}`)
        .setTitle("Shop Error")
        .setDescription("An err occurred while executing the /shop command.")
        .addFields({ name: "Error:", value: `${err}` });
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};