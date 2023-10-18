const { SlashCommandBuilder } = require("discord.js");
const BalanceModel = require("../../models/balance"); // Import your Balance model
const UserSettingsModel = require("../../models/usersettings.js");

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
    } catch (error) {
      console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[DEPOSIT ERROR]`)} ` + `${error}`.bgRed);
      interaction.editReply("An error occurred while processing your deposit.");
    }
  },
};
