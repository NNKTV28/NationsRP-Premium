const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { ownerID } = require("../../config.json");
const Balance = require("../../models/balance");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("run-on-invite")
    .setDescription("Run this command only once after inviting the bot, this command inputs all users into the database")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const user = interaction.user;
    const member = interaction.guild.members.cache.get(user.id);

    // Check if the member has the "ADMINISTRATOR" permission or is the owner of the bot.
    if (member.permissions.has("ADMINISTRATOR") || user.id == ownerID.ownerIDS) {
      try {
        console.log("command run on invite works");
        const guild = interaction.guild;
        const users = await guild.members.fetch();
        console.log(users);
        // Use Promise.all to wait for all database operations to complete
        await Promise.all(users.map(async (user) => {
            console.log("promise works");
          const balance = await Balance.findOne({
            where: { user_id: user.id },
          });
          if (!balance) {
            await Balance.create({
              user_id: user.id,
              user_balance_cash: 0,
              user_balance_bank: 0,
            });
          }
        }));

        await interaction.reply("Done!");
        console.log("Done!");
      } catch (err) {
        console.error(err);
        interaction.reply("An error occurred while processing the command.");
      }
    } else {
      interaction.reply("You don't have the permission to use this command!");
    }
  }
};
