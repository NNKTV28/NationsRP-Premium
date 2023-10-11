const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const globals = require("../../utils/globals.js");
const color = require("colors");
const moment = require("moment");

module.exports = {
    data: new SlashCommandBuilder()
      .setName("synch-db") // must be lower case
      .setDescription("Reloads all commands without restarting the bot")
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Allows the command to be used only by people with an Admin role
      .setDMPermission(false), // Allows the command to be used in DMs
    
    async execute(interaction) {
      await interaction.deferReply({ ephemeral: true });
      try {
        require("../../utils/syncDB.js");
        await interaction.editReply({ content: "DB synched!" });
        console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.green(`[DB SYNCH]`)} ` + `${color.bold.green(`[SUCCESS]`)} ` + `DB Synched!`);
        return;        
      } catch (err) {
        console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[DB SYNCH ERROR]`)} ` + `${err}`.bgRed);
      }
    }
}