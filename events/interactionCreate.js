const { Events, WebhookClient } = require("discord.js");
const { errorWebhookURL } = require('../config.json');
const webhook = new WebhookClient({ url: errorWebhookURL });
const color = require("colors");
const moment = require("moment");

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction) {
    const command = interaction.client.commands.get(interaction.commandName);
    if (interaction.isAutocomplete()) {
      console.log(`Interaction received: ${interaction.commandName}`);
      //const command = interaction.client.commands.get(interaction.commandName)
      if (!command){
        return new Error('There is no code for this autocomplete')
      }else{
        try { 
          await command.autocomplete(interaction) 
        }
        catch (err) { 
          console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[AUTOCOMPLETE INTERACTION ERROR]`)} ` + `${err}`.bgRed);
        }
      }
    }
    // If the command doesn't exist, log it and return.
    if (interaction.isCommand()) {
      if(!command){
        console.error(`No command matching "${interaction.commandName}" was found. Make sure the file exists.`);
        await webhook.send(`No command matching "${interaction.commandName}" was found. Make sure the file exists.`);
      }
      try
      {
        await command.execute(interaction); 
      } catch (err) {
        console.error(`Error while executing "${interaction.commandName}" command:`, err);
        await interaction.reply({
          content: "There was an err while executing this command. Our team has been notified.",
          ephemeral: true,
        });
      }
      
    }
  },
};
