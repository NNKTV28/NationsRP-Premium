const { SlashCommandBuilder } = require("discord.js");
const globals = require("../../utils/globals.js");
const Guild = require("../../models/guild"); // Import your Guild model
const config = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("Change your own settings.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("embedcolor")
        .setDescription("Changes the color of embeds.")
        .addStringOption((option) =>
          option.setName("color")
          .setDescription("The HEX color code you want to set. Add a # before the code.")
          .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("interactions")
        .setDescription("Changes whether or not other users can use certain commands on you.")
        .addBooleanOption((option) =>
          option.setName("interactions").setDescription("Whether or not you want other users to be able to use certain commands on you.").setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("welcomer")
        .setDescription("Toggle the bot's welcome message.")
        .addBooleanOption((option) =>
          option.setName("enabled").setDescription("Toggle the bot's welcome message on/off.").setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("message").setDescription("Custom welcome message to display when users join.").setRequired(false)
        )
    ),
  async execute(interaction) {
    if (interaction.options.getSubcommand() === "embedcolor") {
      if(!config.embedColor){
        Guild.EmbedColor = "yellow";
      }else{
        Guild.EmbedColor = interaction.options.getString("color");
      }
      // ... (Same as before)
    } else if (interaction.options.getSubcommand() === "interactions") {
      // ... (Same as before)
    } else if (interaction.options.getSubcommand() === "welcomer") {
      const isEnabled = interaction.options.getBoolean("enabled");
      const customMessage = interaction.options.getString("message");

        
      // Update the welcome message in the Guilds Database
      const guildData = await Guild.findOne({
        where: { guild_id: interaction.guild.id },
      });
      if (guildData) {
        guildData.welcomeMessage = customMessage;
        await guildData.save();
      }
      if(isEnabled)
      {
        guildData.guild_id = interaction.guild.id;
        interaction.reply("The bot's welcome message has been enabled.")
        guildData.welcomeMessage = customMessage;
        await guildData.save();
        
      }else{
        interaction.reply("The bot's welcome message has been disabled.")
      }
      await interaction.reply({
        content: reply,
        ephemeral: true,
      });
    }
  },
};
