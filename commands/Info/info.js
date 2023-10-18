const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require("discord.js");
const os = require("os");
const UserSettingsModel = require("../../models/usersettings.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Display bot information"),

  async execute(interaction) {
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
    await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });
    // Bot Information
    const botName = interaction.client.user.username;
    const serverName = interaction.guild.name;
    const botPing = `${interaction.client.ws.ping}ms`;
    const cpuUsage = process.cpuUsage().user / 1024 / 1024; // Convert CPU usage to MB
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const nodeVersion = process.versions.node;

    // Calculate bot uptime
    const uptimeMs = Date.now() - interaction.client.uptime;
    const uptimeHours = Math.floor(uptimeMs / 3600000);
    const uptimeMinutes = Math.floor((uptimeMs % 3600000) / 60000);

    // Calculate bot RAM usage as a percentage
    const ramUsage = ((totalMemory - freeMemory) / totalMemory) * 100;
    const formattedRamUsage = ramUsage.toFixed(2);

    const selectorEmbed = {
      color: userRecord.embed_color,
      title: "Bot Information",
      descriprion: "Bot Info menu",
      timestamp: new Date(),
    };
    const select = new StringSelectMenuBuilder()
			.setCustomId('info_selection')
			.setPlaceholder('Make a selection!')
			.addOptions(
				new StringSelectMenuBuilder()
					.setLabel('Commands')
					.setDescription('See the commands of the bot.')
					.setValue('commands'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Bot stats')
					.setDescription('See the bot stats.')
					.setValue('bot-stats'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Uptime')
					.setDescription('See the bot uptime.')
					.setValue('uptime'),
			);

    const selectionRow = new ActionRowBuilder()
			.addComponents(select);
    interaction.editReply(
      {
        content: selectorEmbed,
        components: [selectionRow],
      }
    );
    /*
    // Create the embed
    const embed = {
      color: 0x0099ff,
      title: "Bot Information",
      fields: [
        { name: "Bot Name", value: botName, inline: true },
        { name: "Server Name", value: serverName, inline: true },
        { name: "Bot Ping", value: botPing, inline: true },
        { name: "Bot CPU Usage", value: `${cpuUsage.toFixed(2)}%`, inline: true },
        { name: "Bot RAM Usage", value: `${formattedRamUsage}%`, inline: true },
        { name: "Bot Uptime", value: `${uptimeHours.toFixed(2)}h ${uptimeMinutes}m`, inline: true },
        { name: "", value: ``, inline: true },
        { name: "Node.js Version", value: nodeVersion, inline: true },
        { name: "", value: ``, inline: true },
      ],
      timestamp: new Date(),
    };

    // Send the embed
    interaction.editReply({ embeds: [embed] });
    */
  },
};
