const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const BalanceModel = require('../../models/balance');
const globals = require("../../utils/globals.js");
const color = require("colors");
const moment = require("moment");

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
		const focusedValue = interaction.options.getFocused().toLowerCase() ;
		const choices = ['cash', 'bank'];
		const filtered = choices.filter(choice => choice.startsWith(focusedValue));
		await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
	},

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    try {
        let fields = [];
        let topCashBalances = await BalanceModel.findAll({
            order: [[`user_balance_cash`, 'DESC']],
            limit: 10 // Display top 10 balances, you can change this number as per your requirement
        });
        let topBankBalances = await BalanceModel.findAll({
            order: [[`user_balance_bank`, 'DESC']],
            limit: 10 // Display top 10 balances, you can change this number as per your requirement
        });

        const baltopEmbed = new EmbedBuilder()
            .setTitle("Baltop")
            .addFields(fields);

        if (interaction.options.getString('currency') === 'cash') {
            topCashBalances.forEach((balance, index) => {
                const user = interaction.guild.members.cache.get(balance.user_id);
                fields.push({
                  name: `${index + 1}. ${user.displayName}`,
                  value: `${balance[`user_balance_cash`].toLocaleString()} ${globals.cashEmoji}`,
                  inline: false
                });
            });
        }else if (interaction.options.getString('currency') === 'bank') {
                topBankBalances.forEach((balance, index) => {
                    const user = interaction.guild.members.cache.get(balance.user_id);
                    fields.push({
                      name: `${index + 1}. ${user.displayName}`,
                      value: `${balance[`user_balance_bank`].toLocaleString()} ${globals.BankEmoji}`,
                      inline: false
                    });
                });
        }
        else {
            baltopEmbed.setDescription("not found")
        }

        interaction.editReply({ embeds: [baltopEmbed] });
    } catch (err) {
        // Handle the error appropriately, e.g., send an error message to the user.
        await interaction.editReply('An error occurred while fetching the balance.');
        return console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[BALTOP ERROR]`)} ` + `${err}`.bgRed);
    }
  },
};