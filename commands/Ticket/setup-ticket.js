const { SlashCommandBuilder, Client, CommandInteraction, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, AttachmentBuilder, ApplicationCommandOptionType, ChannelType } = require('discord.js');
const globals = require('../../utils/globals.js');
module.exports = {
    data: new SlashCommandBuilder()
    .setName('setup-ticket')
    .setDescription("Setup a ticket in your server")
    .addChannelOption(option => option
        .setName("channel")
        .setDescription("provide channel to setup ticket")
        .setRequired(true)
    )
    .addChannelOption(option => option
        .setName("category")
        .setDescription("provide category where created ticket will be displayed")
        .setRequired(true)
    ),

    async execute (interaction) {
        // this will get channel & category from options
        const channel = interaction.options.getChannel("channel");
        const category = interaction.options.getChannel("category")

        // this will fetch channel & category from the guild
        //const channel = interaction.guild.channels.cache.get(`${data.id}`);
        //const category = interaction.guild.channels.cache.get(`${data2.id}`)

        // check if the provided channel is visible to bot
        if (!channel.viewable) {
            return interaction.reply({
                content: "The provided channel is not visible to me",
                ephemeral: true
            })
        }

        // check if the provided category is actually a category
        if (category.type !== ChannelType.GuildCategory) {
            return interaction.reply({
                content: "The category you provided is invalid",
                ephemeral: true
            })
        }

        // check if the provided category is visible to bot
        if (!category.viewable) {
            return interaction.reply({
                content: "The provided category is not visible to me",
                ephemeral: true
            })
        }

        if (!category.permissionsFor(interaction.user.id).has("ManageChannels")) {
            return interaction.reply({
                content: "The bot is missing manage-channels permissions to create ticket channel",
                ephemeral: true
            })
        }

        // if you want it in embed format just use below one
        // const embed = new EmbedBuilder()
        //     .setImage("attachment://ticket.png")
        //     .setColor("#2f3136")

        // this will create buttons 
        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`ticket_create`)
                    .setLabel('Create Ticket')
                    .setStyle(ButtonStyle.Success),
            );
        /*
        const attachments = new AttachmentBuilder()
            .setFile(`${globals.path}/Icons/ticket.png`)
        */
        // this will send confirm reply
        await interaction.reply({
            content: `The ticket has been setup to ${channel} successfully.`,
            ephemeral: true
        })

        // this will send the ticket setup to the provided channel
        channel.send({
            // embeds: [embed],
            components: [button],
            //files: [attachments]
        })
    }
}
