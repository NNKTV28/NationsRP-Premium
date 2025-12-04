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
const UserInventoryModel = require("../../models/inventory");

const embedColors = require("../../utils/colors.js");

const parseCooldownSeconds = (value) => {
  const numeric = Number(value);
  if (!Number.isNaN(numeric)) {
    return numeric;
  }

  if (typeof value === 'string') {
    const parts = value.split(':').map(Number);
    if (parts.length === 3 && parts.every((part) => !Number.isNaN(part))) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
  }

  return 0;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("collect")
    .setDescription("Collect items and balance"),

  async execute(interaction) {
    try {
      const userRecord = await UserSettingsModel.findOne({
        where: { user_id: interaction.user.id },
      });

      await interaction.deferReply({ ephemeral: userRecord?.ephemeral_message });

      const guildId = interaction.guild.id;
      const userId = interaction.user.id;

      const [guildMember, balanceIncomeRoles, itemIncomeRoles] = await Promise.all([
        interaction.guild.members.fetch(userId),
        BalanceIncomeRoleModel.findAll({ where: { guild_id: guildId } }),
        ItemIncomeRoleModel.findAll({ where: { guild_id: guildId } }),
      ]);

      const roles = new Set(guildMember.roles.cache.keys());

      let balance = await UserBalanceModel.findOne({ where: { guild_id: guildId, user_id: userId } });
      if (!balance) {
        balance = await UserBalanceModel.create({
          guild_id: guildId,
          user_id: userId,
          user_balance_cash: 0,
          user_balance_bank: 0,
        });
      }

      const receivedEmbed = new EmbedBuilder()
        .setTitle("- Collector -")
        .setColor(embedColors.GENERAL_COLORS.GREEN);

      let collectedCash = 0;
      const collectedItems = [];

      const eligibleBalanceRoles = balanceIncomeRoles.filter((role) => roles.has(role.role_id));
      for (const roleConfig of eligibleBalanceRoles) {
        const [redeemRecord] = await UserIncomeRedeemTimeModel.findOrCreate({
          where: {
            guild_id: guildId,
            user_id: userId,
            role_id: roleConfig.role_id,
          },
          defaults: { balance_redeemed_time: 0 },
        });

        const cooldownMs = parseCooldownSeconds(roleConfig.cooldown_timer) * 1000;
        const lastRedeem = Number(redeemRecord.balance_redeemed_time || 0);
        const now = Date.now();
        const elapsed = now - lastRedeem;

        if (elapsed >= cooldownMs) {
          redeemRecord.balance_redeemed_time = now;
          await redeemRecord.save();

          const amount = Number(roleConfig.amount_to_recieve) || 0;
          collectedCash += amount;
          balance.user_balance_cash += amount;
          await balance.save();

          receivedEmbed.addFields({
            name: `Balance collected from <@&${roleConfig.role_id}>`,
            value: `$${amount.toLocaleString()}`,
          });
        } else {
          const remaining = cooldownMs - elapsed;
          const remainingTime = moment.utc(remaining).format("HH:mm:ss");
          receivedEmbed.addFields({
            name: `Balance role on cooldown <@&${roleConfig.role_id}>`,
            value: `Collectable again in ${remainingTime}.`,
          });
        }
      }

      const eligibleItemRoles = itemIncomeRoles.filter((role) => roles.has(role.role_id));
      for (const roleConfig of eligibleItemRoles) {
        const [redeemRecord] = await UserItemRedeemTimeModel.findOrCreate({
          where: {
            guild_id: guildId,
            user_id: userId,
            role_id: roleConfig.role_id,
          },
          defaults: { item_redeemed_time: 0 },
        });

        const cooldownMs = parseCooldownSeconds(roleConfig.cooldown_timer) * 1000;
        const lastRedeem = Number(redeemRecord.item_redeemed_time || 0);
        const now = Date.now();
        const elapsed = now - lastRedeem;

        if (elapsed >= cooldownMs) {
          redeemRecord.item_redeemed_time = now;
          await redeemRecord.save();

          const amount = Number(roleConfig.amount_to_recieve) || 0;
          const storeItem = await StoreModel.findOne({ where: { itemName: roleConfig.item_to_recieve } });
          const roleToUse = storeItem?.role_to_use || guildId;

          const inventoryEntry = await UserInventoryModel.findOne({
            where: { user_id: userId, item_Name: roleConfig.item_to_recieve },
          });

          if (inventoryEntry) {
            inventoryEntry.item_Amount += amount;
            inventoryEntry.role_to_use = roleToUse;
            await inventoryEntry.save();
          } else {
            await UserInventoryModel.create({
              user_id: userId,
              item_Name: roleConfig.item_to_recieve,
              item_Amount: amount,
              role_to_use: roleToUse,
            });
          }

          collectedItems.push(`${roleConfig.item_to_recieve} x ${amount}`);
        } else {
          const remaining = cooldownMs - elapsed;
          const remainingTime = moment.utc(remaining).format("HH:mm:ss");
          receivedEmbed.addFields({
            name: `Item role on cooldown <@&${roleConfig.role_id}>`,
            value: `Collectable again in ${remainingTime}.`,
          });
        }
      }

      if (!eligibleBalanceRoles.length && !eligibleItemRoles.length) {
        receivedEmbed
          .setColor(embedColors.GENERAL_COLORS.RED)
          .setDescription("You don't have any collectable roles yet.");
      }

      if (collectedCash > 0) {
        receivedEmbed.addFields({
          name: "Total cash collected",
          value: `$${collectedCash.toLocaleString()}`,
        });
      }

      if (collectedItems.length > 0) {
        receivedEmbed.addFields({
          name: "Items collected",
          value: collectedItems.join("\n"),
        });
      }

      await interaction.editReply({ embeds: [receivedEmbed] });
    } catch (err) {
      console.error(err);
      // Example usage:
      globals.sendErrorEmbed("collect.js", err, interaction);
    }
  },
};
