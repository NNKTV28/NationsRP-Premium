const { Events, WebhookClient, ChannelType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { errorWebhookURL } = require('../config.json');
const webhook = new WebhookClient({ url: errorWebhookURL });
const color = require("colors");
const moment = require("moment");
const GuildModel = require('../models/guild');
const TicketModel = require('../models/ticket');
const embedColors = require('../utils/colors');

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
    if (interaction.isButton()) {
      if (interaction.customId === 'ticket_create') {
        try {
          await handleTicketCreate(interaction);
        } catch (err) {
          console.error('Ticket button error:', err);
          if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: 'Failed to create a ticket. Please contact staff.', ephemeral: true }).catch(() => {});
          } else {
            await interaction.reply({ content: 'Failed to create a ticket. Please contact staff.', ephemeral: true }).catch(() => {});
          }
        }
      }
      return;
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

async function handleTicketCreate(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const guildId = interaction.guild.id;
  const guildConfig = await GuildModel.findOne({ where: { guild_id: guildId } });
  if (!guildConfig || !guildConfig.ticket_parent_category) {
    return interaction.editReply({ content: 'Ticket system is not configured yet.', ephemeral: true });
  }

  const existingTicket = await TicketModel.findOne({
    where: {
      guild_id: guildId,
      user_id: interaction.user.id,
      status: 'open',
    },
  });

  if (existingTicket) {
    const channel = interaction.guild.channels.cache.get(existingTicket.channelId);
    if (channel) {
      return interaction.editReply({ content: `You already have an open ticket: ${channel}`, ephemeral: true });
    }
    await existingTicket.destroy();
  }

  const parentCategory = interaction.guild.channels.cache.get(guildConfig.ticket_parent_category);
  if (!parentCategory) {
    return interaction.editReply({ content: 'Ticket category not found. Please ask an admin to reconfigure the ticket system.', ephemeral: true });
  }

  const safeName = interaction.user.username.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'ticket';
  const channelName = `ticket-${safeName}-${Date.now().toString().slice(-4)}`;

  const ticketChannel = await interaction.guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: parentCategory.id,
    topic: `Ticket for ${interaction.user.tag}`,
    reason: `Ticket created by ${interaction.user.tag}`,
  });

  await ticketChannel.permissionOverwrites.edit(interaction.guild.id, {
    ViewChannel: false,
  });

  await ticketChannel.permissionOverwrites.edit(interaction.user.id, {
    ViewChannel: true,
    SendMessages: true,
    AttachFiles: true,
    ReadMessageHistory: true,
  });

  await ticketChannel.permissionOverwrites.edit(interaction.client.user.id, {
    ViewChannel: true,
    SendMessages: true,
    ManageChannels: true,
    ReadMessageHistory: true,
  });

  await TicketModel.create({
    guild_id: guildId,
    user_id: interaction.user.id,
    parentId: parentCategory.id,
    channelId: ticketChannel.id,
    status: 'open',
    subject: 'Support Ticket',
    description: 'No description provided.',
  });

  const ticketEmbed = new EmbedBuilder()
    .setColor(embedColors.TICKET.CREATE_EMBED)
    .setTitle('New Ticket')
    .setDescription(`Welcome ${interaction.user}. Please describe your issue and a staff member will be with you shortly.`)
    .setTimestamp();

  await ticketChannel.send({ embeds: [ticketEmbed] });

  await interaction.editReply({ content: `Ticket created: ${ticketChannel}`, ephemeral: true });
}
