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
    .setName("item-info")
    .setDescription("View information about an existing shop item.")
    .addStringOption((option) =>
      option
      .setName("item")
      .setDescription("Info about the specified item")
      .setRequired(true)
    )
    .setDMPermission(false),

  async execute(interaction) {
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });

    await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });
    const user = interaction.user;
    try {
        const shopItem = await Store.findOne({
            where: { itemName: interaction.options.getString("item") },
        });

      if (!shopItem) {
        const noItemsEmbed = new EmbedBuilder()
          .setTitle('  - Item Error -  ')
          .setColor(`${embedColors.GENERAL_COLORS.RED}`)
          .setDescription('This item doesnt exist in the shop.');
        return interaction.editReply({ embeds: [noItemsEmbed] });
      }
        if(shopItem.itemQuantity == 0)
        {
            itemQuantity = "Infinite"
        }
        let role_to_buy_asigned = shopItem.role_to_buy
        let role_to_use_asigned = shopItem.role_to_use
        if(shopItem.role_to_buy == interaction.guild.id)
        {
            role_to_buy_asigned = "@everyone"
        }else{
            role_to_buy_asigned = `<@&${shopItem.role_to_buy}>`
        }
        if(shopItem.role_to_use == interaction.guild.id)
        {
            role_to_use_asigned = "@everyone"
        }else{
            role_to_buy_asigned = `<@&${shopItem.role_to_use}>`
        }

        const itemsListEmbed = new EmbedBuilder()
          .setTitle(`  - ${shopItem.itemName} information -  `)
          .setColor(`${embedColors.GENERAL_COLORS.GREEN}`)
          .setDescription(`
          **Item Name:** ${shopItem.itemName}\n
          **Item Price:** ${shopItem.itemPrice}\n
          **Item Quantity:** ${shopItem.itemQuantity}\n
          **Item Description:** ${shopItem.itemDescription}\n
          **Role to buy:** ${role_to_buy_asigned}\n
          **Role to use:** ${role_to_use_asigned}\n
          `);
        return interaction.editReply({ embeds: [itemsListEmbed] });
    } catch (err) {
      console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[SHOP ERROR]`)} ` + `${err}`.bgRed);
      const errorEmbed = new EmbedBuilder()
      .setColor(`${embedColors.GENERAL_COLORS.RED}`)
        .setTitle("item-info Error")
        .setDescription("An err occurred while executing the /item-info command.")
        .addFields({ name: "Error:", value: `${err}` });
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};