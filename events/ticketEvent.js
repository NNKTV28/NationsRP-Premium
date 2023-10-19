const { Events, ModalBuilder, TextInputBuilder, ComponentType, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const { errorWebhookURL } = require('../config.json');
const { WebhookClient } = require("discord.js");
const webhook = new WebhookClient({ url: errorWebhookURL });
const TicketModel = require("../models/ticket");
const GuildModel = require("../models/guild.js");

module.exports = {
  name: Events.ticketEvent,
  once: false,
  async execute(interaction) {
    const guildID = interaction.guild.id;
    if (interaction.customId == "ticket_create") {
      const ticketRecord = await GuildModel.findOne({
        where: { guild_id: guildID },
      });
      try {
        // Create the reason prompt
        const reasonPrompt = new ModalBuilder()
        .setCustomId('user_reason_modal_input')
        .setTitle('Provide Reason');
        // modal title
        const reason_modal_title = new TextInputBuilder()
	  		.setCustomId('reason_modal_title')
  			.setLabel("Title")
			  .setStyle(TextInputStyle.Short);
        // Modal body, a.k.a the description
        const reason_modal_body = new TextInputBuilder()
	  		.setCustomId('reason_modal_body')
  			.setLabel("Describe the the issue?")
			  .setStyle(TextInputStyle.Paragraph);
        // Show the modal to the user
		    const reason_prompt_title = new ActionRowBuilder().addComponents(reason_modal_title);
		    const reason_prompt_body = new ActionRowBuilder().addComponents(reason_modal_body);
        // add title and body to the modal
        reasonPrompt.addComponents(reason_prompt_title, reason_prompt_body);
        await interaction.showModal(reasonPrompt);
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
