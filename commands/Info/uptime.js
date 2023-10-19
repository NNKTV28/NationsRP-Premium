const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const UserSettingsModel = require("../../models/usersettings.js");
const embedColors = require("../../utils/colors.js");
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
    const errorEmbed = new EmbedBuilder()
      .setColor(`${embedColors.GENERAL_COLORS.GREEN}`)
        .setTitle("Uptime")
        .addFields({ name: "Up since:", value: `Nations RP Premium has been up since <t:${Math.round(seconds - process.uptime())}:R>` });
      await interaction.editReply({ embeds: [errorEmbed] });
    //await interaction.editReply(`Nations RP Premium has been up since <t:${Math.round(seconds - process.uptime())}:R>`);
  },
};
