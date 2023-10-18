const { Events, WebhookClient, EmbedBuilder } = require("discord.js");
const { errorWebhookURL } = require('../config.json');
const webhook = new WebhookClient({ url: errorWebhookURL });
const color = require("colors");
const moment = require("moment");
const TicketModel = require("../models/ticket");
const GuildModel = require("../models/guild.js");
const ticketEvent = require("./ticketEvent.js");
const UserSettingsModel = require("../models/usersettings.js");

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction) {
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
    const command = interaction.client.commands.get(interaction.commandName);
    console.log(interaction);
    if (interaction.isAutocomplete()) {
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
    if (interaction.customId === 'user_reason_modal_input') 
    {
      const guildID = interaction.guild.id;
      const ticketRecord = await GuildModel.findOne({
        where: { guild_id: guildID },
      });
      const parentCategory = ticketRecord.ticket_parent_category;
      const ticketChannel = await interaction.guild.channels.create({
        name: `Ticket - ${interaction.user.username}`,
        parent: parentCategory ? parentCategory.value : null,
        topic: `Ticket created by ${interaction.user.username}`,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone,
            deny: ['ViewChannel'],
          },
          {
            id: interaction.user.id,
            allow: ['ViewChannel'],
          },
        ],
      });
      // Create the reason button and add it to the reason row
      // Create the embed
      const embed = new EmbedBuilder()
      .setColor(`${userRecord.embed_color}`)
      .setTitle('Create Ticket')
      .setDescription(`Ticket channel created: ${ticketChannel}`)
      .setTimestamp();

      // Send the initial embed
      interaction.reply({
        embeds: [embed],
      })
    }
    // ticket creation interaction
    if (interaction.customId == "ticket_create") {
      try {
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
