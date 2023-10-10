const { SlashCommandBuilder, WebhookClient, EmbedBuilder } = require("discord.js");
const { issueWebhookURL } = require("../../config.json");
const color = require("colors")
const moment = require("moment");

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
      const reportEmbed = new  EmbedBuilder()
      .setTitle("Reported issue")
      .addFields(
        { name: "User", value: `${interaction.user.tag}`, inline: true },
        { name: "Command", value: `${interaction.options.getString("comand")}` },
        { name: "Issue", value: `${interaction.options.getString("issue")}` }
      )

      await interaction.channel.send("Thank you for the report, the developer will look into this...");
      await issueWebook.send({ embeds: [reportEmbed] });
    } catch (err) {
      return console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[REPORT ISSUE ERROR]`)} ` + `${err}`.bgRed);
    }

  },
};
