
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');// Required to import discord.js modules
const color = require("colors"); // required for console output colors
const moment = require("moment"); // required for console output colors 
const UserSettingsModel = require("../../models/usersettings.js");
const itemIncomeRole = require('../../models/itemIncomeRole');
const InventoryModel = require('../../models/inventory');
const StoreModel = require('../../models/store');
const embedColors = require('../../utils/colors.js');

module.exports = {
    // Slash command data (required)
    data: new SlashCommandBuilder()
      .setName("tester") // must be lower case
      .setDescription("A command to test stuff like embeds") // Command description
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Allows the command to be used only by people with an Admin role
    .addSubcommand((subcommand) =>
      subcommand
        .setName("embed")
        .setDescription("Test embed.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("database")
        .setDescription("setup database for testing.")
    ),    
    async execute(interaction) {
        let userRecord = await UserSettingsModel.findOne({
        where: { user_id: interaction.user.id },
        });
        await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });
      try {
        if (interaction.options.getSubcommand() === "embed") {
            let testEmbed = new EmbedBuilder()
            .setColor(`${userRecord.embed_color}`)
            .setTitle("Test Embed")
            .setDescription("This is a test embed.")
            .setTimestamp()
            interaction.editReply({ embeds: [testEmbed] });
        }
        if (interaction.options.getSubcommand() === "database") {
          
          // Check if the item name is valid
          const storeItem = await StoreModel.findOne({ name: itemName });
          
        }
      } catch (err) {
          // Log any errors through the console
        console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[TESTER ERROR]`)} ` + `${err}`.bgRed);
      }
    }
}