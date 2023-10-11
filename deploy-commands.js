require("dotenv").config();
const { REST, Routes } = require("discord.js");
const { clientId, token } = require("./config.json");
const fs = require("node:fs");
const globals = require("./utils/globals.js");
const color = require("colors");
const moment = require("moment");

console.log("---------------------------------------------------------------------------------------------------------------------------------------------------------".yellow);
// subfolder handler
const commandFolders = fs.readdirSync("./commands");
const commands = [];
for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(`./commands/${folder}`).filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    try {
      const command = require(`./commands/${folder}/${file}`);
      if ('data' in command && 'execute' in command) 
      {
        console.log(`[DEPLOY COMAND HANDLER] Command ${file} was executed properly.`.green);
        try {
          commands.push(command.data.toJSON());
        }catch (err) {
          return console.log(`${color.bold.bgRed(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[DEPLOY COMMAND HANDLER ERROR] Error while trying to push command ${file}`)} ` + `${err}`.bgRed);
        }
      }else{
        return console.log(`${color.bold.bgRed(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[DEPLOY COMMAND HANDLER ERROR] Command ${file} does not have data or execute property`)} `);
      }
    } catch (err) {
      return console.log(`${color.bold.bgRed(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[DEPLOY COMMAND HANDLER ERROR] Error while loading ${file}`)} ` + `${err}`.bgRed);
    }
  }
}
const rest = new REST({ version: "10" }).setToken(token || process.env.BOT_Token);
(async () => {
  try {
    console.log(`\n[DEPLOY COMAND HANDLER] Started refreshing ${commands.length} application (/) commands.`.yellow + "\n");
    const data = await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });
    console.log(`[HANDLER - SLASH] ${data.length} Slash commands have been registered successfully to all the guilds.`.green);
  } catch (err) {
    console.log(`${color.bold.bgRed(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[DEPLOY COMMAND HANDLER ERROR] `)} ` + `${err}`.bgRed);
    globals.sendWebhookError(err);
  }
})();