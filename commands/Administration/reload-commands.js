const { SlashCommandBuilder, Collection, Client, PermissionFlagsBits } = require('discord.js');
const globals = require("../../utils/globals.js");
const color = require("colors");
const moment = require("moment");
const fs = require("fs");
const UserSettingsModel = require("../../models/usersettings.js");

module.exports = {
    data: new SlashCommandBuilder()
      .setName("reload-commands") // must be lower case
      .setDescription("Reloads all commands without restarting the bot")
      .addStringOption(option =>
        option.setName('command')
          .setDescription('The command to reload')
          .setRequired(false))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Allows the command to be used only by people with an Admin role
      .setDMPermission(false), // Allows the command to be used in DMs

    async execute(interaction) {
      
      let userRecord = await UserSettingsModel.findOne({
        where: { user_id: interaction.user.id },
      });
      await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });

      const commandName = interaction.options.getString('command');
      // Slash commands
      // Structure: ../../commands/Category/command.js
      const commandFolders = fs.readdirSync("../../commands");
      for (const folder of commandFolders) {
        const commandFiles = fs.readdirSync(`../../commands/${folder}`).filter((file) => file.endsWith(".js"));
        for (const file of commandFiles) {
          const command = require(`./commands/${folder}/${file}`);
          interaction.client.commands.set(command.data.name, command);
          console.log(`[INDEX HANDLER] Loaded command ${command.data.name} from ${folder}/${file}`.green);
        }
      }
      try {
        if(commandName == null) {
          interaction.editReply(`Command to reload not specified, reloading all commands.`);
        }else{
          const command = interaction.client.commands.get(commandName);
          delete require.cache[require.resolve(`${commandFolders}/${command.data.name}.js`)];
          try {
            interaction.client.commands.delete(command.data.name);
            const newCommand = require(`${commandFolders}/${command.data.name}.js`);
            interaction.client.commands.set(newCommand.data.name, newCommand);
            await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded!`);

          } catch (err) { 
            console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[RELOAD COMMANDS ERROR]`)} ${err}`)
          }
          if (!command) {
            return interaction.editReply(`There is no command with name \`${command}\`!`);
          }
        }        
      } catch (err) {
        console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[RELOAD COMMANDS ERROR]`)} ${err}`)
      }
    }
}