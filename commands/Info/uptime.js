const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const UserSettingsModel = require("../../models/usersettings.js");

module.exports = {
  data: new SlashCommandBuilder()
  .setName("uptime")
  .setDescription("Responds with Bot's uptime."),
  async execute(interaction) {
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
    await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });
    
    const seconds = Math.round(Date.now() / 1000);
    await interaction.editReply(`Nations RP Premium has been up since <t:${Math.round(seconds - process.uptime())}:R>`);
  },
};
