const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// Models
const BalanceIncomeRoleModel = require("../../models/balanceIncomeRole");
const ItemIncomeRoleModel = require("../../models/itemIncomeRole");
const userInventoryModel = require("../../models/inventory");
const UserIncomeRedeemTimeModel = require("../../models/userIncomeRedeemTime");
const UserItemRedeemTime = require("../../models/userItemRedeemTime");
const UserBalanceModel = require("../../models/balance");
const UserSettingsModel = require("../../models/usersettings.js");

const embedColors = require("../../utils/colors.js");
const moment = require("moment");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("collect")
    .setDescription("Collect items and balance"),

  async execute(interaction) {
    // Fetch user settings and defer the reply
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
    await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });
    try {
      const guildMember = await interaction.guild.members.fetch(
        interaction.user.id
      );
      const roles = [...guildMember.roles.cache.keys()];
      console.log([...roles]);
      console.log(interaction.guild.id);

      // Find the balance income roles stored in the Database
      const balanceIncomeRoles = await BalanceIncomeRoleModel.findAll({
        where: { guild_id: interaction.guild.id, role_id: [...roles] },
      });
      // Find the item income roles stored in the Database
      const itemIncomeRoles = await ItemIncomeRoleModel.findAll({
        where: { guild_id: interaction.guild.id, role_id: [...roles] },
      });
      // Find the balance redeem timer of a user (this is if the user redeemed the balance already)
      const IncomeRedeemTime = await UserIncomeRedeemTimeModel.findOne({
        where: { user_id: interaction.user.id },
      });
      // Find the item redeem timer of a user (this is if the user redeemed the item already)
      const ItemIncomeRedeemTime = await UserItemRedeemTime.findOne({
        where: { user_id: interaction.user.id },
      });
      // Find the balance of a user
      const balance = await UserBalanceModel.findOne({
        where: { user_id: interaction.user.id },
      });
      const userInventory = await userInventoryModel.findAll({
        where: { user_id: interaction.user.id },
      });

      // Create an embed to display redeemed items and balance
      const receivedEmbed = new EmbedBuilder();

      // Redeem balance if the user has the role stored in the Database
      for (const roleId of roles) {
        const balanceIncomeRole = balanceIncomeRoles.find(
          (role) => role.role_id === roleId
        );

        if (balanceIncomeRole) {
          console.log(
            `BalanceIncomeRole detected: ${balanceIncomeRole.length}`.green
          );

          if (!IncomeRedeemTime) {
            console.log("Creating redeem time for user");
            await UserIncomeRedeemTimeModel.create({
              role_id: balanceIncomeRole.role_id,
              user_id: interaction.user.id,
              balance_redeemed_time: Date.now(),
            });
          } else {
            const currentTime = Date.now();
            const lastIncomeRedeemTime =
              IncomeRedeemTime.balance_redeemed_time || 0; // Initialize to 0 if it's null
            const cooldown = balanceIncomeRole.cooldown_timer * 1000;
            const timeElapsed = currentTime - lastIncomeRedeemTime;

            if (timeElapsed < cooldown) {
              const remainingCooldown = cooldown - timeElapsed;
              const remainingSeconds = Math.ceil(remainingCooldown / 1000);
              const remainingTime = moment.utc(remainingSeconds * 1000).format("HH:mm:ss");
              receivedEmbed.addFields({
                name: "Balance not collected",
                value: `You can redeem again in ${remainingTime} Hours.`,
              });
            } else {
              // Update the balance_redeemed_time in the database to the current time
              IncomeRedeemTime.balance_redeemed_time = currentTime;
              await IncomeRedeemTime.save();

              if (!balance) {
                balance = await UserBalanceModel.create({
                  user_id: interaction.user.id,
                  user_balance_cash: balanceIncomeRole.amount_to_recieve,
                  user_balance_bank: 0,
                });
              } else {
                balance.user_balance_cash += balanceIncomeRole.amount_to_recieve;
              }
              await balance.save();

              receivedEmbed.addFields({
                name: "Balance collected",
                value: `$${balanceIncomeRole.amount_to_recieve}`,
              });
            }
          }
        }
      }
      // Initialize an array to store redeemed items
      const redeemedItems = [];

      // Loop through the roles and check for item redemption
      for (const roleId of roles) {
        const matchingItemRoles = itemIncomeRoles.filter(
          (itemRole) => itemRole.role_id === roleId
        );
        if (matchingItemRoles.length > 0) {
          console.log(
            `ItemIncomeRoles detected for roleId ${roleId}: ${matchingItemRoles.length}`
              .green
          );
          // Check item redemption time for each matching item role
          const currentTime = Date.now();
          for (const itemRole of matchingItemRoles) {
            const lastItemRedeemTime = ItemIncomeRedeemTime
              ? ItemIncomeRedeemTime.item_redeemed_time
              : 0;
            const cooldown = parseInt(itemRole.cooldown_timer) * 1000;
            const timeElapsed = currentTime - lastItemRedeemTime;

            if (timeElapsed < cooldown) {
              const remainingCooldown = cooldown - timeElapsed;
              const remainingSeconds = Math.ceil(remainingCooldown / 1000);
              const remainingTime = moment
                .utc(remainingSeconds * 1000)
                .format("HH:mm:ss");
              receivedEmbed.addFields({
                name: `Item ${itemRole.item_to_recieve} not collected`,
                value: `You can collect again in ${remainingTime} Hours.`,
              });
            } else {
              // Update the item_redeemed_time in the database to the current time
              ItemIncomeRedeemTime.item_redeemed_time = currentTime;
              await ItemIncomeRedeemTime.save();

              // Redeem the items
              const existingItem = userInventory.find(
                (item) => item.item_Name === itemRole.item_to_recieve
              );
              if (existingItem) {
                existingItem.item_Amount += itemRole.amount_to_recieve;
                await existingItem.save();
              } else {
                await userInventoryModel.create({
                  user_id: interaction.user.id,
                  item_Name: itemRole.item_to_recieve,
                  item_Amount: itemRole.amount_to_recieve,
                });
              }
              redeemedItems.push(
                `${itemRole.item_to_recieve} x ${itemRole.amount_to_recieve}.`
              );
            }
          }
        }
      }
      // Check if any items were redeemed and add them to the receivedEmbed
      if (redeemedItems.length > 0) {
        receivedEmbed.addFields({
          name: "Item collected",
          value: redeemedItems.join("\n"),
        });
      }
      // Send a embed depending if the user has any redeemable roles
      if (balanceIncomeRoles.length > 0 || itemIncomeRoles.length > 0) {
        receivedEmbed.setColor(`${embedColors.GENERAL_COLORS.GREEN}`);
        receivedEmbed.setTitle("Collected Successfully");
        receivedEmbed.setDescription("Collected successfully.");
      } else {
        receivedEmbed.setColor(`${embedColors.GENERAL_COLORS.RED}`);
        receivedEmbed.setTitle("Collect Failed");
        receivedEmbed.setDescription("You don't have any collectable roles.");
      }
      // Edit the interaction reply with the embed
      await interaction.editReply({ embeds: [receivedEmbed] });
      
      // Helper function to parse the cooldown time from HH:MM:SS format to milliseconds
      function parseCooldownTime(cooldownTime) {
        const [hours, minutes, seconds] = cooldownTime.split(':').map(Number);
        return (hours * 3600 + minutes * 60 + seconds) * 1000;
      }

      // Helper function to format the remaining cooldown time in HH:mm:ss format
      function formatCooldownTime(remainingTime) {
        const seconds = Math.floor(remainingTime / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        seconds %= 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }

    } catch (err) {
      console.error(err);
      const errorEmbed = new EmbedBuilder()
        .setColor(`${embedColors.GENERAL_COLORS.RED}`)
        .setTitle("Collect Error")
        .setDescription("An err occurred while collecting.")
        .addFields({ name: "Error:", value: `${err}` });
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
