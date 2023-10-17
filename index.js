require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const color = require("colors");
const moment = require("moment");

// credentials
const token = process.env.BOT_token;
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

// Slash commands
// Structure: ./commands/Category/command.js
client.commands = new Collection();
const commandFolders = fs.readdirSync("./commands");

for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(`./commands/${folder}`).filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.data.name, command);
    //console.log("\u001b[1;36mLoaded command " + `'${command.data.name}'` + " from /" + folder + "/" + file + "\u001b[0m");
    console.log(`[INDEX HANDLER] Loaded command ${command.data.name} from ${folder}/${file}`.green);
  }
}

// Event handler
// Structure: ./events/event.js
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith(".js"));
try {
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
} catch (err) {
  console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[INDEX ERROR]`)} ` + `${err}`);
}

try {
  //require("./deploy-commands.js")
  client.login(token);

} catch (err) {
  console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[INDEX ERROR]`)} ` + `${err}`.bgRed);
}

module.exports = client;
