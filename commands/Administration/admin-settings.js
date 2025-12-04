const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType, ButtonStyle } = require('discord.js');
const GuildModel = require("../../models/guild.js");
const UserSettingsModel = require("../../models/usersettings.js");
const embedColors = require('../../utils/colors.js');

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
    const guildID = interaction.guild.id;
    const userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
    await interaction.deferReply({ ephemeral: userRecord?.ephemeral_message });

    const ticketChannel = interaction.options.getChannel("channel");
    const parentCategory = interaction.options.getChannel("parent-category");

    if (interaction.options.getSubcommand() === "ticket-system") {
        // check if the provided channel is visible to bot
      if (!ticketChannel || !ticketChannel.viewable || !ticketChannel.isTextBased()) {
            return interaction.editReply({
          content: "The provided channel must be a text channel that I can access.",
                ephemeral: true
            })
        }

        // check if the provided category is actually a category
      if (!parentCategory || parentCategory.type !== ChannelType.GuildCategory) {
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

      const botMember = interaction.guild.members.me;
      if (!botMember.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.editReply({
                content: "The bot is missing manage-channels permissions to create ticket channel",
                ephemeral: true
            })
        }
        await GuildModel.upsert({
          guild_id: guildID,
          ticket_parent_category: parentCategory.id,
        });

        const buttonRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('ticket_create')
            .setLabel('Create Ticket')
            .setStyle(ButtonStyle.Success)
        );

        const ticketEmbed = new EmbedBuilder()
          .setColor(embedColors.GENERAL_COLORS.BLUE)
          .setTitle('Support Tickets')
          .setDescription('Need help? Click the button below to open a private ticket with our staff team.');

        await interaction.editReply({
          content: `Ticket panel sent to ${ticketChannel} successfully.`,
          ephemeral: true,
        });

        await ticketChannel.send({
          embeds: [ticketEmbed],
          components: [buttonRow],
        });
      
    } 
  },
};

/* legacy prototype removed */