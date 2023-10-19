const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder } = require("discord.js");
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
    const selectorEmbed = new EmbedBuilder()
      .setColor(`${userRecord.embed_color}`)
      .setTitle("Bot Information")
      .setDescription("Bot Info menu")
      .setTimestamp(new Date())
    
    const select = new StringSelectMenuBuilder()
			.setCustomId('info_selection')
			.setPlaceholder('Make a selection!')
			.addOptions(
				new StringSelectMenuOptionBuilder()
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
        embeds: [selectorEmbed],
        components: [selectionRow],
      }
    );
    // Respond with the bot stats when the bot-stats option is selected
    const collector = interaction.channel.createMessageComponentCollector({
      componentType: "StringSelectMenu",
    }
    );
    collector.on("collect", async (interaction) => {
      if (interaction.customId === "info_selection") {
        if (interaction.values[0] === "commands") {
          // display all deployed slash commands
          interaction.client.commands.forEach((command) => {
            console.log(`${command.data.name}: ${command.data.description}`);
          });
          interaction.editReply("Commands");
        }
      }
    });
    collector.on("collect", async (interaction) => {
      if (interaction.customId === "info_selection") {
        if (interaction.values[0] === "uptime") {
          const uptimeMs = Date.now() - interaction.client.uptime;
          const uptimeHours = Math.floor(uptimeMs / 3600000);
          const uptimeMinutes = Math.floor((uptimeMs % 3600000) / 60000);
          interaction.editReply(`Uptime: ${uptimeHours}h ${uptimeMinutes}m`);
          const uptimeEmbed = new EmbedBuilder()
          .setColor(`${embedColors.GENERAL_COLORS.GREEN}`)
            .setTitle("Uptime")
            .addFields({ name: "Up since:", value: `Nations RP Premium has been up since ${uptimeHours}h ${uptimeMinutes}m` });
          await interaction.editReply({ embeds: [uptimeEmbed] });
        }
      }
    });
    collector.on("collect", async (interaction) => {
      if (interaction.customId === "info_selection") {
        if (interaction.values[0] === "bot-stats") {
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
        }
      }
    });
  },
};
