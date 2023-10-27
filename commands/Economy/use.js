const { SlashCommandBuilder } = require('discord.js');
const Inventory = require('../../models/inventory'); // Import your Inventory model
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
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
    await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });

    try {
      const userId = interaction.user.id;

      // Find the user's inventory items
      const userInventory = await Inventory.findAll({
        where: { user_id: userId },
        attributes: ['item_Name', 'item_Amount'],
      });

      if (!userInventory || userInventory.length === 0) {
        return interaction.editReply('You dont own that item, use /buy to get it.');
      } else {
        
      }
    } catch (error) {
        console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[USE ERROR]`)} ` + `${error}`.bgRed);
        interaction.editReply('An error occurred while fetching your inventory.');
        const errorEmbed = new EmbedBuilder()
          .setColor(`${embedColors.GENERAL_COLORS.RED}`)
          .setTitle('Error')
          .setDescription(error);
        interaction.channel.send({ embeds: [errorEmbed] })
    }
  },
};
