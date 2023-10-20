const { Events, ModalBuilder } = require("discord.js");
const { errorWebhookURL } = require('../config.json');
const { WebhookClient } = require("discord.js");
const webhook = new WebhookClient({ url: errorWebhookURL });
const color = require("colors");
const moment = require("moment");
const TicketModel = require("../models/ticket");

module.exports = {
  name: Events.ticketEvent,
  once: false,
  async execute(interaction) {
    if (interaction.customId == "ticket_create") {
      try {
        console.log("Interaction received: ticket_create");
        // Handle ticket creation logic here
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
        // Create the reason prompt
        const reasonPrompt = new ModalBuilder()
        .setTitle('Provide Reason')
        .setDescription('Please provide a reason for opening this ticket.')
        .setRequired(true);

        // Create the reason button and add it to the reason row

        const reasonRow = new ActionRowBuilder()
        .addComponents(reasonPrompt);

        // Create the embed
        const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Create Ticket')
        .setDescription(`Ticket channel created: ${ticketChannel}`)
        .addFields(
            {name: 'Reason:', value: 'Not provided'}
        )
        .setTimestamp();

        // Send the initial embed
        await interaction.reply({
        embeds: [embed],
        components: [reasonRow],
        });

        // Collect the reason response
        const collector = interaction.channel.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60000, // 60 seconds
        });

        collector.on('collect', async (buttonInteraction) => {
        if (buttonInteraction.customId === 'reason_button') {
            await buttonInteraction.reply('Please provide a reason for opening this ticket.');
        }
        });

      } catch (error) {
        console.error(`Error while handling ticket creation:`, error);
        await interaction.reply({
          content: "There was an error while handling your ticket creation. Our team has been notified.",
          ephemeral: true,
        });
        await webhook.send(`Error while handling ticket creation: ${error}`);
      }
    }
  },
};
