const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const Guild = require('../../models/guild');
const color = require("colors");
const moment = require("moment");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-welcome-channel")
    .setDescription("Sets the welcome channel and welcome message.")
    .addChannelOption(option => option
        .setName('channel')
        .setDescription('The channel to set as the welcome channel')
        .addChannelTypes(ChannelType.GuildText)
    )
    .addStringOption(option => option
        .setName('role')
        .setDescription('The role the user gets once they join the welcome channel')
        .setRequired(false)
    )
    .addStringOption(option => option
        .setName("welcome_message")
        .setDescription("The message to send to the user once they join the welcome channel.")
        .setRequired(false)
    )
    .setDMPermission(false),
    
  async execute(interaction) 
  {
    await interaction.deferReply({ ephemeral: true });
    const { options, member } = interaction;
    const channel = await options.getChannel('channel');
    const welcomeMessage = options.getString('welcome_message');
    const welcomeRoleID = options.getString('role');
    const [ guild ] = await Guild.findOrCreate({ where: { guild_id: interaction.guild.id } })
    
    try {
      if (!member.permissions.has(PermissionFlagsBits.Administrator))
      {
        interaction.editReply('You do not have permission to use this command.');
        return;
      }
      if (!channel)
      {
        interaction.editReply('Please specify a channel.');
        return;
      }
      await guild.update({ welcomeChannelID: channel.id, welcomeMessage: welcomeMessage, welcomeRoleID: welcomeRoleID });
      interaction.editReply(`Welcome channel set to ${channel} and welcome message updated.`);
      
    } catch (err) {
      console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[ SET WELCOME CHANNEL ERROR]`)} ` + `${err}`.bgRed);
    }
  },
};