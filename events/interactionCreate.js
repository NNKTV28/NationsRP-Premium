const { Events, WebhookClient } = require("discord.js");
const { errorWebhookURL } = require('../config.json');
const webhook = new WebhookClient({ url: errorWebhookURL });
const color = require("colors");
const moment = require("moment");
const TicketModel = require("../models/ticket");
const ticketEvent = require("./ticketEvent.js");

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
      } catch (error) {
        console.error(`Error while executing "${interaction.commandName}" command:`, error);
        await interaction.reply({
          content: "There was an error while executing this command. Our team has been notified.",
          ephemeral: true,
        });
      }
      
    }
    
    // ticket creation interaction
    if (interaction.customId == "ticket_create") {
      try {
        console.log("Interaction received: ticket_create")
        await ticketEvent.execute(interaction);
      } catch (error) {
        console.error(`Error while handling ticket creation:`, error);
        await interaction.reply({
          content: "There was an error while handling your ticket creation. Our team has been notified.",
          ephemeral: true,
        });
      }
    }
  },
};
