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
    const guildID = interaction.guild.id;
    

    // Check if the member has the "ADMINISTRATOR" permission or is the owner of the bot.
    if (member.permissions.has("ADMINISTRATOR") || user.id == ownerID.ownerIDS) {
      try {
        const guild = interaction.guild;
        const users = await guild.members.fetch();
        // Use Promise.all to wait for all database operations to complete
        await Promise.all(users.map(async (user) => {
          const balance = await Balance.findOne({
            where: { user_id: user.id },
          });
          // check if the User is a bot
          if (user.user.bot) {
            return;
          }else{
            if (!balance) {
              await Balance.create({
                guild_id: guildID,
                user_id: user.id,
                user_balance_cash: 0,
                user_balance_bank: 0,
              });
            }
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
