const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const BalanceModel = require('../../models/balance');
const UserSettingsModel = require("../../models/usersettings.js");
const globals = require("../../utils/globals.js");
const moment = require("moment");
const color = require("colors");
const embedColors = require('../../utils/colors.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("baltop")
    .setDescription("Shows the balance leaderboard.")
    .setDMPermission(false)
    .addStringOption(option => 
        option.setName('currency')
        .setDescription('The currency you want to see the baltop')
        .setRequired(true).setAutocomplete(true)),
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const choices = ['cash', 'bank'];
        const filtered = choices.filter(choice => choice.startsWith(focusedValue));
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        );
    },
  async execute(interaction) {
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
    await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });
    const guild = interaction.guild;

    try {
        const currency = interaction.options.getString('currency');
        const topBalances = await BalanceModel.findAll({
            order: [[`user_balance_${currency}`, 'DESC']],
            limit: 10 // Display top 10 balances, you can change this number as per your requirement
        });

        if (topBalances.length === 0) {
            return interaction.editReply({ content: `No one with ${currency} found`, ephemeral: true });
        }

        // Fetch members using the user_ids from topBalances
        const userIDs = topBalances.map(balance => balance.user_id);
        const members = await guild.members.fetch({ user: userIDs });

        const baltopEmbed = new EmbedBuilder()
            .setTitle("Nations RP | Diplomatic Leaderboard")
            .setDescription(`Leaderboard for ${currency}`)
            .setColor(embedColors.GENERAL_COLORS.GREEN);

        for (let index = 0; index < topBalances.length; index++) {
            const balance = topBalances[index];
            const user = members.get(balance.user_id);

            if (user) {
                baltopEmbed.addFields({
                    name: `${index + 1}. ${user.displayName}`,
                    value: `${balance[`user_balance_${currency}`].toLocaleString()} ${currency === 'cash' ? globals.cashEmoji : globals.BankEmoji}`,
                    inline: false,
                });
            }
        }
        interaction.editReply({ embeds: [baltopEmbed] });
    } catch (err) {
        console.error(err);
        const errorEmbed = new EmbedBuilder()
            .setColor(`${embedColors.GENERAL_COLORS.RED}`)
            .setTitle("/baltop Error")
            .setDescription("An error occurred while executing the /baltop command.")
            .addFields({ name: "Error:", value: `${err}` 
            });
        return await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
