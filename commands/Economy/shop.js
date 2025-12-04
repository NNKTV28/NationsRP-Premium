const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const color = require("colors")
const moment = require("moment");

const Store = require('../../models/store');
const Balance = require('../../models/balance');
const globals = require("../../utils/globals.js");
const UserSettingsModel = require("../../models/usersettings.js");
const embedColors = require('../../utils/colors.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("View items available in the shop.")
    .setDMPermission(false),

  async execute(interaction) {
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });

    await interaction.deferReply({ ephemeral: userRecord?.ephemeral_message });
    const user = interaction.user;
    try {
      const items = await Store.findAll({
        attributes: ['itemName', 'itemPrice', 'itemDescription', 'itemQuantity', 'role_to_buy'],
      });

      const userBalance = await Balance.findOne({
        where: { guild_id: interaction.guild.id, user_id: user.id },
      });

      if (!items || items.length === 0) {
        const noItemsEmbed = new EmbedBuilder()
          .setTitle('  - Shop -  ')
          .setDescription('There are no items in the shop.');
        return interaction.editReply({ embeds: [noItemsEmbed] });
      } else {
        const itemsListEmbed = new EmbedBuilder()
          .setTitle('  - Shop -  ')
          .setColor(`${embedColors.GENERAL_COLORS.GREEN}`)

        for (const item of items) {
          let Unlimited = item.itemQuantity;
          if(Unlimited == 0){
            Unlimited = "Unlimited"
          }else{
            Unlimited = item.itemQuantity
          }

          const canAfford = userBalance && userBalance.user_balance_cash >= item.itemPrice;
          const roleRequirement = item.role_to_buy === interaction.guild.id ? '@everyone' : `<@&${item.role_to_buy}>`;

          const displayPrice = Number(item.itemPrice).toLocaleString();

          if (canAfford) {
            itemsListEmbed.addFields(
              { name: `${item.itemName} - ${displayPrice}$ - Available: ${Unlimited} - ${globals.Yes}`, value: `Required Role: ${roleRequirement}\n${item.itemDescription}`},
            );
          } else {            
            itemsListEmbed.addFields(
              { name: `${item.itemName} - ${displayPrice}$ - Available: ${Unlimited} - ${globals.No}`, value: `Required Role: ${roleRequirement}\n${item.itemDescription}`},
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