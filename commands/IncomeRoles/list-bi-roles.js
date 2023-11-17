const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const balanceIncomeList = require('../../models/balanceIncomeRole');
const colors = require("../../utils/colors.js");
const UserSettingsModel = require("../../models/usersettings.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("list-bi-roles")
    .setDescription("View items available in the shop.")
    .setDMPermission(false),

  async execute(interaction) {
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
    await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });
    /*const balanceRoles = await balanceIncomeList.findAll({
      attributes: [ 'guild_id', 'role_id', 'amount_to_recieve', 'cooldown_timer']
    });*/
    const balanceRoles = await balanceIncomeList.findAll({
      where: {guild_id: interaction.guild.id}
    });

    try {
      const redeemEmbed = new EmbedBuilder()
        .setTitle('  - Balance Income Roles -  ')
        .setColor(`${colors.GENERAL_COLORS.GREEN}`);
      if (!balanceRoles) {
        return interaction.editReply('There are no item roles yet.');
      } else {
        for (const role of balanceRoles) 
        {
          //const timerToReceive = role.timer_to_recieve;
          //const timerToReceiveSeconds = timerToReceive.split(':').reduce((acc, curr) => acc * 60 + +curr);
          //redeemEmbed.setDescription(`**<@&${role.role_id}>** - ${role.ammount_to_recieve}$ - ${timerToReceiveSeconds}h\n`);
          redeemEmbed.addFields(
            {name: "Role: ", value: `<@&${role.role_id}>`},
            {name: "Ammount to recieve: ", value: `${role.amount_to_recieve}$`, inline: true},
            {name: "Cooldown: ", value: `${role.cooldown_timer}`, inline: true}
          );
        }
        return interaction.editReply({embeds: [redeemEmbed]});
      }
    } catch (err) {
      console.error(err);
      interaction.editReply('An err occurred while fetching the income items.');
    }
  },
};
