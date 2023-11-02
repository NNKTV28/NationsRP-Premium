const { SlashCommandBuilder, WebhookClient, EmbedBuilder } = require("discord.js");
const { issueWebhookURL } = require("../../config.json");
const embedColors = require("../../utils/colors.js");
const color = require("colors")
const moment = require("moment");
const UserSettingsModel = require("../../models/usersettings.js");

const issueWebook = new WebhookClient({
    url: issueWebhookURL,
})

module.exports = {
  data: new SlashCommandBuilder()
  .setName("report-issue")
  .setDescription("Report an issue to the developers issue webhook.")
  .addStringOption(option => option
    .setName("comand")
    .setDescription("The command you want to report.")
    .setRequired(true))
  .addStringOption(option => option
    .setName("issue")
    .setDescription("The issue you want to report.")
    .setRequired(true)),

  async execute(interaction) {
    try {
      let userRecord = await UserSettingsModel.findOne({
        where: { user_id: interaction.user.id },
      });
      await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });

      const reportEmbed = new  EmbedBuilder()
      .setTitle("Reported issue")
      .setColor(`${embedColors.GENERAL_COLORS.YELLOW}`)
      .addFields(
        { name: "User", value: `${interaction.user.tag}`, inline: true },
        { name: "Command", value: `${interaction.options.getString("comand")}` },
        { name: "Issue", value: `${interaction.options.getString("issue")}` }
      )
      const successEmbed = new EmbedBuilder()
      .setColor(`${embedColors.GENERAL_COLORS.RED}`)
        .setTitle("Report Issue")
        .setDescription("Issue reported to the Developer.")
        .addFields({ name: "Report successful:", value: `Thank you for the report, the developer will look into this...` });
      await interaction.editReply({ embeds: [successEmbed] });
      await issueWebook.send({ embeds: [reportEmbed] });
    } catch (err) {
      console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[REPORT ISSUE ERROR]`)} ` + `${err}`.bgRed);
      const errorEmbed = new EmbedBuilder()
      .setColor(`${embedColors.GENERAL_COLORS.RED}`)
        .setTitle("Report Issue  Error")
        .setDescription("An err occurred while reporting an issue.")
        .addFields({ name: "Error:", value: `${err}` });
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
