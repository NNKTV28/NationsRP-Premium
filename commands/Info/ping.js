const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js"); 
const globals = require("../../utils/globals.js");
const UserSettingsModel = require("../../models/usersettings.js");

module.exports = {
  category: "Info",
  cooldown: 15,
  devOnly: false,
  guildOnly: false,
  voiceOnly: false,
  nsfwOnly: false,
  toggleOffCmd: false,
  maintenanceCmd: false,

  data: new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Show discord bot latency.")
      .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands),

  /**
   * @param {ChatInputCommandInteraction} interaction 
   * @param {Client} client 
   */

  async execute(client, interaction) {
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
    await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });

    try {
      const ws = "https://panel.riotnodes.co.uk/server/d904932f";
      // Function Uptime
      let days = Math.floor(client.uptime / 86400000)
      let hours = Math.floor(client.uptime / 3600000) % 24
      let minutes = Math.floor(client.uptime / 60000) % 60
      let seconds = Math.floor(client.uptime / 1000) % 60

      // Latency Check
      let webLatency = new Date() - interaction.createdAt
      let apiLatency = client.ws.ping
      let totalLatency = webLatency + apiLatency
  
      interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setColor(totalLatency < 200 ? Embed.Colors.successcolor : totalLatency < 500 ? Embed.Colors.stanbycolor : Embed.Colors.wrongcolor)
            .setTitle(`Returns Latency And API Ping`)
            .addFields(
            {
              name: `📡 Websocket Latency`,
              value: `\`${webLatency <= 200 ? globals.GreenEmoji : webLatency <= 400 ? globals.YellowEmoji : globals.RedEmoji}\` \`${webLatency}\`ms`,
              inline: true
            },
            {
              name: `🛰 API Latency`,
              value: `\`${apiLatency <= 200 ? globals.GreenEmoji : apiLatency <= 400 ? globals.YellowEmoji : globals.RedEmoji}\` \`${apiLatency}\`ms`,
              inline: true
            },
            {
              name: `⏲ Uptime`,
              value: `\`${days}Days\` : \`${hours}Hrs\` : \`${minutes}Mins\` : \`${seconds}Secs\``,
              inline: true
            })
        ],
      });
    } catch (error) {
      globals.sendWebhookError(error);
    }
  }
};