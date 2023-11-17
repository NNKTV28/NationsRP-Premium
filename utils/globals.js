const chance = require("chance").Chance();
const { WebhookClient, EmbedBuilder } = require("discord.js");
const { errorWebhookURL, issueWebhookURL} = require("../config.json");
const errorWebhook = new WebhookClient({ url: errorWebhookURL });
const issueWebook = new WebhookClient({ url: issueWebhookURL });
const embedColors = require("./colors.js");

// Emoji variables. Change these out with your own.
// Discord bots have "Nitro", so this is fine. To grab the id, escape the emoji with a backslash (e.g \:emoji:)

// General Stats
const coinEmoji = "<:Coins:1109913124171153438>";
const hpEmoji = "<:RpgHeart:1119594242994618459>";
const Yes = "✅";
const No = "❌";
const GreenEmoji = '🟢';
const YellowEmoji = '🟡';
const RedEmoji = '🔴';
const BankEmoji = "🏦";
const cashEmoji = "💵";

// Shop
const descriptionEmoji = "<:SpeechBubble:1121299256150610030>";

// Database Models
const Guild = require('../models/guild');
const Store = require('../models/store');
const ItemIncomeRole = require('../models/itemIncomeRole');
const BalanceIncomeRole = require('../models/balanceIncomeRole');
const Balance = require('../models/balance');
const Inventory = require('../models/inventory');
const Ticket = require('../models/ticket');
const AdminRoles = require('../models/adminroles');

// send errors to the webhook channel
const sendWebhookError = (message) => {
  errorWebhook.send(message);
}
const sendIssueWebhook  = () => {
  issueWebook.send(`**User: \`${interaction.user.tag}\`**\n**Command: \`${interaction.options.getString("command name")}\`**\n**Issue: \`${interaction.options.getString("issue")}\`**`);
}

const getUserRoles = (interaction) => {
  const guildMember = interaction.guild.members.fetch(interaction.user.id);
  const roles = [...guildMember.roles.cache.keys()];
  return roles;
}

const sendErrorEmbed = (filename, err, interaction) => {
  const errorEmbed = new EmbedBuilder()
    .setColor(`${embedColors.GENERAL_COLORS.RED}`)
    .setTitle(`${filename} Error`)
    .setDescription(`An error occurred while executing ${filename}.`)
    .addFields({ name: "Error:", value: `${err}` });

  interaction.editReply({ embeds: [errorEmbed] });
};

module.exports = {
  // Emojis
  coinEmoji,
  hpEmoji,
  BankEmoji,
  cashEmoji,
  Yes,
  No,
  descriptionEmoji,
  GreenEmoji,
  YellowEmoji,
  RedEmoji,
  // Quick copy paste functions
  getUserRoles,
  sendWebhookError,
  sendErrorEmbed,
  sendIssueWebhook,
};
