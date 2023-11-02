const { SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField, Role } = require("discord.js");
const config = require("../../config.json");
const Balance = require("../../models/balance");
const AdminRolesModel = require("../../models/adminroles");
const GuildModel = require("../../models/guild");
const UserSettingsModel = require("../../models/usersettings");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("run-on-invite")
    .setDescription("Run this command only once after inviting the bot, this command inputs all users into the database")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    // fetch the interaction user
    const user = interaction.user;
    // fetch the guild id
    const guildID = interaction.guild.id;
    // fetch all members in a guild
    const members = await interaction.guild.members.fetch();
    // fetch all roles in a guild
    const roles = await interaction.guild.roles.fetch();

    // Check if the member has the "ADMINISTRATOR" permission or is the owner of the bot.
    if (user.id == config.ownerIDS) {
      try {
        // Find or create the guild record in the database
        let guildRecord = await GuildModel.findOne({
          where: { guild_id: guildID },
        });
        if (!guildRecord) {
          console.log(`Guild ${guildID} is not in the database, adding it now`);
          guildRecord = await GuildModel.create({
            guild_id: guildID,
            embed_color: config.defaultEmbedColor,
            ephemeral: false,
          });
        }

        // Use Promise.all to wait for all database operations to complete
        await Promise.all(members.map(async (user) => {
          const balance = await Balance.findOne({
            where: { user_id: user.id },
          });

          let userRecord = await UserSettingsModel.findOne({
            where: { user_id: user.id },
          });
          if (!userRecord) {
            console.log(`User ${user.id} is not in the database, adding it now`);
            if (user.user.bot) {
              userRecord = await UserSettingsModel.create({
                guild_id: guildID,
                user_id: user.id,
                is_bot: true,
                ephemeral_message: false,
                embed_color: config.defaultEmbedColor
              });
            }else{
              userRecord = await UserSettingsModel.create({
                guild_id: guildID,
                user_id: user.id,
                is_bot: false,
                ephemeral_message: false,
                embed_color: config.defaultEmbedColor
              });
            } 
          }
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
        interaction.reply("An err occurred while processing the command.");
      }
    } else {
      interaction.reply("You don't have the permission to use this command!");
    }
  }
};
