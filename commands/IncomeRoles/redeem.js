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
    .setName("redeem")
    .setDescription("Redeem items and balance"),

  async execute(interaction) {
    // Fetch user settings and defer the reply
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
    await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });
    try {
      const guildMember = await interaction.guild.members.fetch(interaction.user.id);
      const roles = guildMember.roles.cache.keys();
      console.log([...roles])
      console.log(interaction.guild.id)

      const balanceIncomeRoles = await BalanceIncomeRoleModel.findAll({
        where: { guild_id: interaction.guild.id, role_id: [...roles] },
      });
      const itemIncomeRoles = await ItemIncomeRoleModel.findAll({
        where: { guild_id: interaction.guild.id, role_id: [...roles] },
      });
      const IncomeRedeemTime = await UserIncomeRedeemTimeModel.findOne({
        where: { user_id: interaction.user.id },
      });
      const ItemIncomeRedeemTime = await UserItemRedeemTime.findOne({
        where: { user_id: interaction.user.id },
      });
      const balance = await UserBalanceModel.findOne({
        where: { user_id: interaction.user.id },
      });

      // Create an embed to display redeemed items and balance
      const receivedEmbed = new EmbedBuilder()
        .setColor(`${embedColors.GENERAL_COLORS.GREEN}`)
        .setTitle("Redeemed Successfully")
        .setDescription("Redeemed successfully.");

      // Redeem balance if the user has the role stored in the Database
      
      if (balanceIncomeRoles) 
      {
        console.log(`BalanceIncomeRoles detected: ${balanceIncomeRoles.length}`.green)
        if (!IncomeRedeemTime) {
          console.log("Creating redeem time for user");
          await UserIncomeRedeemTimeModel.create({
            role_id: balanceIncomeRoles[0].role_id,
            user_id: interaction.user.id,
            balance_redeemed_time: Date.now() 
            });
        } else {
          const currentTime = Date.now();
          const lastIncomeRedeemTime = IncomeRedeemTime.balance_redeemed_time || currentTime;
          const cooldown = balanceIncomeRoles.reduce((acc, curr) => acc + parseInt(curr.cooldown_timer) * 1000, 0);
          const timeElapsed = currentTime - lastIncomeRedeemTime;
  
          if (timeElapsed < cooldown) {
            const remainingCooldown = cooldown - timeElapsed;
            const remainingSeconds = Math.ceil(remainingCooldown / 1000);
            const remainingTime = moment.utc(remainingSeconds * 1000).format("HH:mm:ss");
            receivedEmbed.addFields(
              {
                name: "Balance not redeemed",
                value: `You can redeem again in ${remainingTime} Hours.`,
              }
            )
          } else {
            // Update the balance_redeemed_time in the database to the current time
            IncomeRedeemTime.balance_redeemed_time = currentTime;
            await IncomeRedeemTime.save();
            if (!balance) {
              balance.user_balance_cash = balanceIncomeRoles[0].amount_to_recieve;
              balance.user_balance_bank = 0;
            } else {
              balance.user_balance_cash += balanceIncomeRoles[0].amount_to_recieve;
            }
            await balance.save();
            receivedEmbed.addFields({
              name: "Balance Redeemed",
              value: `$${balanceIncomeRoles[0].amount_to_recieve}`,
            });
            console.log("Balance Redeemed");
          }
        }        
      }else{
        console.log(`no balanceIncomeRoles detected`.red)
      }


      // Redeem items if roles exist
      if (itemIncomeRoles) {
        console.log(`itemIncomeRoles detected: ${itemIncomeRoles.length}`.green)
        const userInventory = await userInventoryModel.findAll({
          where: { user_id: interaction.user.id },
        });
        if (!ItemIncomeRedeemTime) {
          ItemIncomeRedeemTime = await UserItemRedeemTime.create({ 
            role_id: itemIncomeRoles[0].role_id,
            user_id: interaction.user.id,
            item_redeemed_time: Date.now() 
            });
        } else {
          const currentTime = Date.now();
          const lastItemRedeemTime = ItemIncomeRedeemTime.item_redeemed_time || currentTime;
          const cooldown = itemIncomeRoles.reduce((acc, curr) => acc + parseInt(curr.item_redeemed_time) * 1000, 0);
          const timeElapsed = currentTime - lastItemRedeemTime;
  
          if (timeElapsed < cooldown) {
            const remainingCooldown = cooldown - timeElapsed;
            const remainingSeconds = Math.ceil(remainingCooldown / 1000);
            const remainingTime = moment.utc(remainingSeconds * 1000).format("HH:mm:ss");
            receivedEmbed.addFields(
              {
                name: "Item not redeemed",
                value: `You can redeem again in ${remainingTime} Hours.`,
              }
            )
          } else {
            // Update the item_redeemed_time in the database to the current time
            ItemIncomeRedeemTime.item_redeemed_time = currentTime;
            await ItemIncomeRedeemTime.save();
            for (const itemRole of itemIncomeRoles) {
              const existingItem = userInventory.find((item) => item.item_Name === itemRole.item_to_recieve);
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
              receivedEmbed.addFields({
                name: "Item Redeemed",
                value: `${itemRole.item_to_recieve} x ${itemRole.amount_to_recieve}`,
              });
            }
          }
        }
      }else{
        console.log(`no itemIncomeRoles detected`.red)
      }
      // Edit the interaction reply with the embed
      await interaction.editReply({ embeds: [receivedEmbed] });
    } catch (err) {
      console.error(err);
      const errorEmbed = new EmbedBuilder()
      .setColor(`${embedColors.GENERAL_COLORS.RED}`)
        .setTitle("Redeem Error")
        .setDescription("An error occurred while redeeming.")
        .addFields({ name: "Error:", value: `${err}` });
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
