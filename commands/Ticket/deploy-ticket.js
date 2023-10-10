const { SlashCommandBuilder, MessageEmbed, MessageButton, MessageActionRow, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('deploy-ticket')
  .setDescription('Creates a ticket channel')
  .addChannelOption(option => option
    .setName("parent_category")
    .setDescription("The parent category to create the ticket channel in")
  ),

  async execute(interaction) {
    try {
      const parentCategory = interaction.options.get('parent_category');
      //const channelName = `Ticket - ${interaction.user.username}`;
      
      // Create the ticket channel
      const ticketChannel = await interaction.guild.channels.create(`Ticket - ${interaction.user.username}`, {
        parent: parentCategory ? parentCategory.value : null,
        topic: `Ticket created by ${interaction.user.username}`,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone,
            deny: ['VIEW_CHANNEL'],
          },
          {
            id: interaction.user.id,
            allow: ['VIEW_CHANNEL'],
          },
        ],
      });

      // Create the reason prompt
      const reasonButton = new EmbedBuilder()
        .setCustomId('reason_button')
        .setLabel('Provide Reason')
        .setStyle('PRIMARY');

      const reasonRow = new MessageActionRow().addComponents(reasonButton);

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
        componentType: 'BUTTON',
        time: 60000, // 60 seconds
      });

      collector.on('collect', async (buttonInteraction) => {
        if (buttonInteraction.customId === 'reason_button') {
          await buttonInteraction.reply('Please provide a reason for opening this ticket.');
        }
      });
    } catch (error) {
      console.error(error);
      await interaction.reply('An error occurred while creating the ticket.');
    }
  },
};