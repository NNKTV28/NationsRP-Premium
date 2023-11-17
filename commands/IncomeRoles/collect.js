const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const moment = require("moment");
const globals = require("../../utils/globals.js");

// Models
const BalanceIncomeRoleModel = require("../../models/balanceIncomeRole");
const ItemIncomeRoleModel = require("../../models/itemIncomeRole");
const UserIncomeRedeemTimeModel = require("../../models/userIncomeRedeemTime");
const UserItemRedeemTimeModel = require("../../models/userItemRedeemTime");
const UserBalanceModel = require("../../models/balance");
const UserSettingsModel = require("../../models/usersettings.js");
const StoreModel = require("../../models/store.js");
const userInventoryModel = require("../../models/inventory");

const embedColors = require("../../utils/colors.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("collect")
    .setDescription("Collect items and balance"),

  async execute(interaction) {
    try {
      // Fetch user settings and defer the reply
      const userRecord = await UserSettingsModel.findOne({
        where: { user_id: interaction.user.id },
      });

      await interaction.deferReply({ ephemeral: userRecord?.ephemeral_message });

      const guildMember = await interaction.guild.members.fetch(interaction.user.id);
      const roles = [...guildMember.roles.cache.keys()];

      // Find the balance income roles stored in the Database
      const balanceIncomeRoles = await BalanceIncomeRoleModel.findAll({
        where: { guild_id: interaction.guild.id, role_id: roles },
      });

      // Find the item income roles stored in the Database
      const itemIncomeRoles = await ItemIncomeRoleModel.findAll({
        where: { guild_id: interaction.guild.id, role_id: roles },
      });

      // Find or create the balance redeem timer for a user
      let incomeRedeemTime = await UserIncomeRedeemTimeModel.findOne({
        where: { guild_id: interaction.guild.id, user_id: interaction.user.id },
      });

      if (!incomeRedeemTime) {
        incomeRedeemTime = await UserIncomeRedeemTimeModel.create({
          guild_id: interaction.guild.id,
          user_id: interaction.user.id,
          balance_redeemed_time: Date.now(),
        });
      }

      // Find the balance of a user
      let balance = await UserBalanceModel.findOne({
        where: { guild_id: interaction.guild.id, user_id: interaction.user.id },
      });

      // Create an embed to display redeemed items and balance
      const receivedEmbed = new EmbedBuilder().setTitle(" - Collector - ");

      // Redeem balance if the user has the role stored in the Database
      for (const roleId of roles) {
        const balanceIncomeRole = balanceIncomeRoles.find(role => role.role_id === roleId);

        if (balanceIncomeRole) {
          const currentTime = Date.now();
          const lastIncomeRedeemTime = incomeRedeemTime.balance_redeemed_time || 0;
          const cooldown = balanceIncomeRole.cooldown_timer * 1000;
          const timeElapsed = currentTime - lastIncomeRedeemTime;

          if (timeElapsed >= cooldown) {
            // Update the balance_redeemed_time in the database to the current time
            incomeRedeemTime.balance_redeemed_time = currentTime;
            await incomeRedeemTime.save();

            // Update or create the balance
            balance = balance || (await UserBalanceModel.create({
              guild_id: interaction.guild.id,
              user_id: interaction.user.id,
              user_balance_cash: 0,
              user_balance_bank: 0,
            }));

            balance.user_balance_cash += balanceIncomeRole.amount_to_recieve;
            await balance.save();

            receivedEmbed.addFields({
              name: "Balance collected",
              value: `$${balanceIncomeRole.amount_to_recieve}`,
            });
          } else {
            const remainingCooldown = cooldown - timeElapsed;
            const remainingSeconds = Math.ceil(remainingCooldown / 1000);
            const remainingTime = moment.utc(remainingSeconds * 1000).format("HH:mm:ss");

            receivedEmbed.addFields({
              name: `Balance role: <@&${roleId}>`,
              value: `You can redeem again in ${remainingTime} Hours.`,
            });
          }
        }
      }

      // Initialize an array to store redeemed items
      const redeemedItems = [];

      // Find or create the item redeem timer for a user
      let itemRedeemTime = await UserItemRedeemTimeModel.findOne({
        where: { guild_id: interaction.guild.id, user_id: interaction.user.id },
      });

      // Loop through the roles and check for item redemption
      for (const roleId of roles) {
        const matchingItemRoles = itemIncomeRoles.filter(itemRole => itemRole.role_id === roleId);

        for (const itemRole of matchingItemRoles) {
          const item_use_role = await StoreModel.findOne({
            where: { itemName: itemRole.item_to_recieve },
          });
          const userInventory = await userInventoryModel.findAll({
            where: { user_id: interaction.user.id },
          })
          if (!itemRedeemTime) {
            itemRedeemTime = await UserItemRedeemTimeModel.create({
              guild_id: interaction.guild.id,
              user_id: interaction.user.id,
              item_redeemed_time: Date.now(),
            });
          }

          const currentTime = Date.now();
          const lastItemRedeemTime = itemRedeemTime.item_redeemed_time || 0;
          const cooldown = parseInt(itemRole.cooldown_timer) * 1000;
          const timeElapsed = currentTime - lastItemRedeemTime;

          if (timeElapsed >= cooldown) {
            // Update the item_redeemed_time in the database to the current time
            itemRedeemTime.item_redeemed_time = currentTime;
            await itemRedeemTime.save();

            // Redeem the items
            const existingItem = userInventory.findOne(item => item.item_Name === itemRole.item_to_recieve);
            
            if (existingItem) {
              existingItem.item_Amount += itemRole.amount_to_recieve;
              await existingItem.save();
            } else {
              await userInventoryModel.create({
                user_id: interaction.user.id,
                item_Name: itemRole.item_to_recieve,
                item_Amount: itemRole.amount_to_recieve,
                role_to_use: item_use_role.role_to_use,
              });
            }
            redeemedItems.push(`${itemRole.item_to_recieve} x ${itemRole.amount_to_recieve}.`);
          } else {
            const remainingCooldown = cooldown - timeElapsed;
            const remainingSeconds = Math.ceil(remainingCooldown / 1000);
            const remainingTime = moment.utc(remainingSeconds * 1000).format("HH:mm:ss");

            receivedEmbed.addFields({
              name: `Item ${itemRole.item_to_recieve} not collected`,
              value: `You can collect again in ${remainingTime} Hours.`,
            });
          }
        }
      }
      // Check if any items were redeemed and add them to the receivedEmbed
      if (redeemedItems.length > 0) {
        receivedEmbed.addFields({ name: "Items collected", value: redeemedItems.join("\n")});
      }
      // Send a embed depending if the user has any redeemable roles
      if (balanceIncomeRoles.length <= 0 && itemIncomeRoles.length <= 0) {
        receivedEmbed.setColor(`${embedColors.GENERAL_COLORS.RED}`);
        receivedEmbed.setDescription("You don't have any collectable roles.");
      }
      // Edit the interaction reply with the embed
      await interaction.editReply({ embeds: [receivedEmbed] });
    } catch (err) {
      console.error(err);
      // Example usage:
      globals.sendErrorEmbed("collect.js", err, interaction);

    }
  },
};
