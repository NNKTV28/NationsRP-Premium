const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, PermissionFlagsBits, MessageEmbed, MessageButton, MessageActionRow, EmbedBuilder, ComponentType, ChannelType, ButtonStyle } = require('discord.js');
const Globals = require("../../utils/globals.js");
const GuildModel = require("../../models/guild.js");
const UserSettingsModel = require("../../models/usersettings.js");
const TicketModel = require("../../models/ticket.js");
const { where } = require('sequelize');

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
    // get user settings
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
    await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });

    if (interaction.options.getSubcommand() === "ticket-system") {
        // Ticket system variables
        const buttonChannel = interaction.options.getChannel("channel");
        const parentCategory = interaction.options.getChannel("parent-category");
        // check if the provided channel is visible to bot
        if (!buttonChannel.viewable) {
            return interaction.editReply({
                content: "The provided channel is not visible to me",
                ephemeral: true
            })
        }
        // check if the provided category is actually a category
        if (parentCategory.type !== ChannelType.GuildCategory) 
        {
          return interaction.editReply({
            content: "The category you provided is invalid",
            ephemeral: true
          })
        }

        // check if the provided category is visible to bot
        if (!parentCategory.viewable) {
            return interaction.editReply({
                content: "The provided category is not visible to me",
                ephemeral: true
            })
        }

        if (!parentCategory.permissionsFor(interaction.user.id).has("ManageChannels")) {
            return interaction.editReply({
                content: "I'm missing PermissionFlagsBits.ManageChannels permissions to create ticket channel",
                ephemeral: true
            })
        }
        const ticketRecord = await GuildModel.findOne({
          where: { guild_id: guildID },
        });
        if(!ticketRecord)
        {
           await GuildModel.create(
            {
              ticket_parent_category: parentCategory.id,
            }
          )
        }else{
          await GuildModel.update(
            {
              ticket_parent_category: parentCategory.id,
            },
            {
              where: { guild_id: guildID },
            }
          )
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
            content: `The ticket has been setup to ${buttonChannel} successfully.`,
            ephemeral: true
        })

        // this will send the ticket setup to the provided channel
        buttonChannel.send({
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
    } catch (error) {
      console.error(error);
      await interaction.reply('An error occurred while creating the ticket.');
    }
  },
};
*/