const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder} = require("discord.js");
const embedColors = require("../../utils/colors.js");
const Store = require("../../models/store");
const BalanceModel = require("../../models/balance");
const Inventory = require("../../models/inventory");
const UserSettingsModel = require("../../models/usersettings.js");
const color = require("colors");
const moment = require("moment");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("buy")
    .setDescription("Buy an item from the shop.")
    .addStringOption((option) =>
      option
        .setName("item")
        .setDescription("The item you want to buy")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of the item you want to buy")
        .setRequired(true)
    )
    .setDMPermission(false),

  async execute(interaction) {
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
    await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });

    const userId = interaction.user.id;
    // fetch the roles of the guild depending on the interaction of the user who used the command
    const guildMember = await interaction.guild.members.fetch(
      interaction.user.id
    );
    const roles = [...guildMember.roles.cache.keys()];
    const itemName = interaction.options.getString("item");
    const amount = interaction.options.getInteger("amount");

    try {
      for (const roleId of roles) {
        const response = await processBuyAction(userId, itemName, amount, roleId);

        if (response.err) {
          const errorEmbed = new EmbedBuilder()
            .setColor(`${embedColors.GENERAL_COLORS.RED}`)
            .setTitle("Error")
            .setDescription(response.err);
          return interaction.editReply({ embeds: [errorEmbed] });
        }

        return interaction.editReply({ embeds: [response.embed] });
      }
    } catch (err) {
      console.error(err);
      interaction.editReply("An err occurred while processing your purchase.");
    }
  },
};

async function processBuyAction(userId, itemName, amount, roleId) {
  const userBalance = await BalanceModel.findOne({
    where: { user_id: userId },
  });

  if (!userBalance) {
    return { err: "User balance not found." };
  }

  const matchingBuyRoles = await Store.findOne({
    where: { itemName: itemName, role_to_use: roleId },
  });

  if (!matchingBuyRoles) {
    const noBuyRole = new EmbedBuilder()
      .setColor(`${embedColors.GENERAL_COLORS.RED}`)
      .setTitle("Not Allowed")
      .setDescription("You don't own a valid role to buy the item.")
      .addFields({
        name: `Item not bought: ${itemName}`,
        value: `You don't own a valid role to buy the item.`,
      });
    return { embed: noBuyRole };
  }

  const itemInStore = await Store.findOne({
    where: { itemName: itemName },
  });

  if (!itemInStore) {
    return { err: `Item "${itemName}" does not exist in the shop.` };
  }

  if (amount === 0) {
    return { err: "Amount must be greater than 0." };
  }

  if (amount > itemInStore.itemQuantity) {
    return {
      err: `There isn't enough of this item in the store. Currently, there's only ${itemInStore.itemQuantity} ${itemName} left`,
    };
  }

  if (userBalance.user_balance_cash < itemInStore.itemPrice * amount) {
    return { err: "You don't have enough cash to buy this item." };
  }

  const oldUserBalance = userBalance.user_balance_cash;
  userBalance.user_balance_cash -= itemInStore.itemPrice * amount;
  await userBalance.save();

  const response = await handleUserInventory(userId, itemName, amount, itemInStore);

  return {
    embed: response,
  };
}

async function handleUserInventory(userId, itemName, amount, itemInStore) {
  const userInventory = await Inventory.findOne({
    where: { user_id: userId, item_Name: itemName },
  });

  const oldUserItem = userInventory ? userInventory.item_Amount : 0;

  if (!userInventory || userInventory.length == 0) {
    userInventory = await Inventory.create({
      user_id: userId,
      item_Name: itemName,
      item_Amount: amount,
      role_to_use: itemInStore.role_to_use,
    });

    if (itemInStore.itemQuantity > 0) {
      itemInStore.itemQuantity -= amount;
      await itemInStore.save();
    }
  } else {
    userInventory.item_Amount += amount;
    await userInventory.save();

    if (itemInStore.itemQuantity === null) {
      console.log("Item is infinite");
    } else {
      itemInStore.itemQuantity -= amount;
      await itemInStore.save();
    }
  }

  const successEmbed = new EmbedBuilder()
    .setColor(embedColors.GENERAL_COLORS.GREEN)
    .setTitle("Successful Buy")
    .setDescription(`You successfully bought "${itemName}" for ${itemInStore.itemPrice}$.`)
    .addFields(
      {
        name: `Item ${itemName} added:`,
        value: `${oldUserItem} + ${amount} = ${oldUserItem + amount}`,
      },
      {
        name: `New Balance: ${userBalance.user_balance_cash}`,
        value: `${oldUserBalance} - ${itemInStore.itemPrice} = ${userBalance.user_balance_cash}`,
      }
    )
    .setTimestamp();

  return successEmbed;
}