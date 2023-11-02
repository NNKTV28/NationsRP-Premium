const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, PermissionFlagsBits, MessageEmbed, MessageButton, MessageActionRow, EmbedBuilder, ComponentType } = require('discord.js');
const Globals = require("../../utils/globals.js");
const GuildModel = require("../../models/guild.js");
const UserSettingsModel = require("../../models/usersettings.js");
const TicketModel = require("../../models/ticket.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin-settings")
    .setDescription("Change Bots settings.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("ticket-system")
        .setDescription("Setup the ticketing system.")
        .addChannelOption(option => option
            .setName("channel")
            .setDescription("provide channel to send the button")
            .setRequired(true)
        )
        .addChannelOption(option => option
            .setName("parent-category")
            .setDescription("provide category where created ticket will be displayed")
            .setRequired(true)
        ),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(interaction) {
    // Global variables
    const guildID = interaction.guild.id;
    // get all guilds
    let guildRecord = await GuildModel.findOne({
      where: { guild_id: guildID },
    });
    // get user settings
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
    await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });
    // Ticket system variables
    const parentCategory = interaction.options.getChannel("channel");
    const category = interaction.options.getChannel("category")

    if (interaction.options.getSubcommand() === "ticket-system") {
        // check if the provided channel is visible to bot
        if (!channel.viewable) {
            return interaction.editReply({
                content: "The provided channel is not visible to me",
                ephemeral: true
            })
        }

        // check if the provided category is actually a category
        if (category.type !== ChannelType.GuildCategory) {
            return interaction.editReply({
                content: "The category you provided is invalid",
                ephemeral: true
            })
        }

        // check if the provided category is visible to bot
        if (!category.viewable) {
            return interaction.editReply({
                content: "The provided category is not visible to me",
                ephemeral: true
            })
        }

        if (!category.permissionsFor(interaction.user.id).has("ManageChannels")) {
            return interaction.editReply({
                content: "The bot is missing manage-channels permissions to create ticket channel",
                ephemeral: true
            })
        }
        // this will create buttons 
        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`ticket_create`)
                    .setLabel('Create Ticket')
                    .setStyle(ButtonStyle.Success),
            );

        // this will send confirm reply
        await interaction.editReply({
            content: `The ticket has been setup to ${channel} successfully.`,
            ephemeral: true
        })

        // this will send the ticket setup to the provided channel
        channel.send({
            components: [button],
        })
      
    } 
  },
};

/*
      // Create the reason prompt
      const reasonButton = new ButtonBuilder()
        .setCustomId('reason_button')
        .setLabel('Provide Reason')
        .setStyle('Primary');

      const reasonRow = new ActionRowBuilder()
      .addComponents(reasonButton);

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
    } catch (err) {
      console.error(err);
      await interaction.reply('An err occurred while creating the ticket.');
    }
  },
};
*/