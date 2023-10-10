const { SlashCommandBuilder } = require("discord.js");
const { incr } = require("../../utils/globals.js");
const config = require ("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
  .setName("uptime")
  .setDescription("Responds with Bot's uptime."),
  async execute(interaction) {
    const seconds = Math.round(Date.now() / 1000);
    await interaction.reply(`Nations RP Premium has been up since <t:${Math.round(seconds - process.uptime())}:R>`);
  },
};
