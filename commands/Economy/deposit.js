const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const BalanceModel = require("../../models/balance"); // Import your Balance model
const UserSettingsModel = require("../../models/usersettings.js");
const embedColors = require('../../utils/colors.js');
const color = require("colors");
const moment = require("moment");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deposit')
    .setDescription("Deposit money from your cash balance into the bank.")
    .addIntegerOption((option) =>
      option.setName("amount").setDescription("The amount to deposit into the bank.").setRequired(true)
    )
    .setDMPermission(false),

  async execute(interaction) {
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
    await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });

    const user = interaction.user;
    const amount = interaction.options.getInteger("amount");

    try {
      // Check if the user's balance exists in the database
      let userBalance = await BalanceModel.findOne({
        where: { user_id: user.id },
      });

      if (!userBalance) {
        userBalance = await BalanceModel.create({
          user_id: user.id,
          user_balance_cash: 0,
          user_balance_bank: 0,
        });
      }

      // Check if the user has enough cash to deposit
      if (userBalance.user_balance_cash < amount) {
        return interaction.editReply("You don't have enough cash to deposit that amount.");
      }

      // Deposit the money into the bank and deduct it from cash balance
      userBalance.user_balance_cash -= amount;
      userBalance.user_balance_bank += amount;

      // Save the updated balance
      await userBalance.save();

      interaction.editReply(`You successfully deposited ${amount}$ into the bank.`);
    } catch (err) {
      console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[DEPOSIT ERROR]`)} ` + `${err}`.bgRed);
      const errorEmbed = new EmbedBuilder()
        .setColor(`${embedColors.GENERAL_COLORS.RED}`)
        .setTitle("/Deposit Error")
        .setDescription("An err occurred while executing the /deposit command.")
        .addFields({ name: "Error:", value: `${err}` });
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
