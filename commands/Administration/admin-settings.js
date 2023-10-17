const { SlashCommandBuilder } = require("discord.js");
const globals = require("../../utils/globals.js");
const GuildModel = require("../../models/guild.js");
const UserSettingsModel = require("../../models/usersettings.js");
const config = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin-settings")
    .setDescription("Change Bots settings.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("ticket-system")
        .setDescription("Setup the ticketing system.")
        .addChannelOption(option => option
            .setName("channel")
            .setDescription("provide channel to setup ticket")
            .setRequired(true)
        )
        .addChannelOption(option => option
            .setName("category")
            .setDescription("provide category where created ticket will be displayed")
            .setRequired(true)
        ),
    ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });
    const guildID = interaction.guild.id;
    // get all guilds
    let guildRecord = await GuildModel.findOne({
      where: { guild_id: guildID },
    });
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });

    if (interaction.options.getSubcommand() === "embedcolor") {
      
      if(interaction.options.getString("color").length != 7)
      {
        interaction.reply("The color introduced is not a HEX color.")
      }else{
        guildRecord.embed_color = interaction.options.getString("color");
        await guildRecord.save();
        interaction.reply(`The embed color has been changed to ${interaction.options.getString('color')}`)
      
      }
      
    } else if (interaction.options.getSubcommand() === "interactions") {
      
      if(interaction.options.getBoolean("ephemeral") == true)
      {
        userRecord.ephemeral_message = true;
        await userRecord.save();
        interaction.reply("Ephemeral messages are now enabled.")
      }else{
        userRecord.ephemeral_message = false;
        await userRecord.save();
        interaction.reply("Ephemeral messages are now disabled.")
      }
    } 
  },
};
