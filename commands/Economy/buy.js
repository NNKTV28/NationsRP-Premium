// Import necessary modules and dependencies
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const embedColors = require("../../utils/colors.js");
const Store = require("../../models/store");
const BalanceModel = require("../../models/balance");
const Inventory = require("../../models/inventory");
const UserSettingsModel = require("../../models/usersettings.js");

// Export a Discord Slash Command
module.exports = {
  // Define the slash command data using Discord.js SlashCommandBuilder
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

  // Execute function that handles the slash command
  async execute(interaction) {
    // Retrieve user settings record
    let userRecord = await UserSettingsModel.findOne({
      where: { user_id: interaction.user.id },
    });
  
    // Defer reply with ephemeral message settings
    await interaction.deferReply({ ephemeral: userRecord?.ephemeral_message });
  
    // Extract relevant information from the interaction
    const userId = interaction.user.id;
    const guildMember = await interaction.guild.members.fetch(interaction.user.id);
    const roles = [...guildMember.roles.cache.keys()];
    const itemName = interaction.options.getString("item");
    const amount = interaction.options.getInteger("amount");
    const guildId = interaction.guild.id;
  
    try {
      // Process buy action and receive response
      const response = await processBuyAction(guildId, userId, itemName, amount, roles);
  
      // Handle errors or edit reply with success response
      if (response.err) {
        const errorEmbed = new EmbedBuilder()
          .setColor(`${embedColors.GENERAL_COLORS.RED}`)
          .setTitle("Error")
          .setDescription(response.err);
        return interaction.editReply({ embeds: [errorEmbed] });
      }
      return interaction.editReply({ embeds: [response.embed] });
    } catch (err) {
      console.error(err);
      return interaction.editReply("An error occurred while processing your purchase.");
    }
  }
}

// Asynchronous function to process the buy action
async function processBuyAction(guildId, userId, itemName, amount, roles) {
  if (!Number.isInteger(amount) || amount <= 0) {
    return { err: "Amount must be greater than 0." };
  }

  // Retrieve user balance from the database
  const [userBalance] = await BalanceModel.findOrCreate({
    where: { guild_id: guildId, user_id: userId },
    defaults: {
      user_balance_cash: 0,
      user_balance_bank: 0,
    },
  });

  // Retrieve the item details from the store
  const itemInStore = await Store.findOne({
    where: { itemName: itemName },
  });

  // Return an error if the item does not exist in the shop
  if (!itemInStore) {
    return { err: `Item "${itemName}" does not exist in the shop.` };
  }

  const requiredRoleId = itemInStore.role_to_buy;
  const hasRequiredRole = !requiredRoleId || requiredRoleId === guildId || roles.includes(requiredRoleId);
  if (!hasRequiredRole) {
    const noBuyRole = new EmbedBuilder()
      .setColor(`${embedColors.GENERAL_COLORS.RED}`)
      .setTitle("Not Allowed")
      .setDescription("You don't own a valid role to buy the item.")
      .addFields({
        name: `Required role`,
        value: `<@&${requiredRoleId}>`,
      });
    return { embed: noBuyRole };
  }

  if (itemInStore.itemQuantity && itemInStore.itemQuantity > 0 && amount > itemInStore.itemQuantity) {
    return {
      err: `There isn't enough of this item in the store. Currently, there's only ${itemInStore.itemQuantity} ${itemName} left`,
    };
  }

  // Check if the user has enough cash to buy the item
  const pricePerUnit = Number(itemInStore.itemPrice);
  if (Number.isNaN(pricePerUnit) || pricePerUnit <= 0) {
    return { err: "The store price for this item is invalid." };
  }
  const totalPrice = pricePerUnit * amount;
  if (userBalance.user_balance_cash < totalPrice) {
    return { err: "You don't have enough cash to buy this item." };
  }

  // Store the old user balance and update the balance after the purchase
  const oldUserBalance = userBalance.user_balance_cash;
  userBalance.user_balance_cash -= totalPrice;
  await userBalance.save();

  // Handle user inventory and return success response
  let response = await handleUserInventory({
    guildId,
    userId,
    itemName,
    amount,
    itemInStore,
    userBalance,
    totalPrice,
    oldUserBalance,
  });

  return {
    embed: response,
  };
}

// Asynchronous function to handle user inventory after a successful purchase
async function handleUserInventory({ guildId, userId, itemName, amount, itemInStore, userBalance, totalPrice, oldUserBalance }) {
  // Retrieve user inventory from the database
  let userInventory = await Inventory.findOne({
    where: { user_id: userId, item_Name: itemName },
  });

  // Store the old user item amount
  const oldUserItem = userInventory ? userInventory.item_Amount : 0;
  const oldShopItemQuantity = itemInStore.itemQuantity;
  const roleToUse = itemInStore.role_to_use || guildId;
  // Check if user inventory does not exist
  if (!userInventory) {
    // Create a new inventory record for the user
    userInventory = await Inventory.create({
      user_id: userId,
      item_Name: itemName,
      item_Amount: amount,
      role_to_use: roleToUse,
    });

    // Update item quantity in the store if it is not infinite
    
    if (itemInStore.itemQuantity && itemInStore.itemQuantity > 0) {
      if (oldShopItemQuantity == 1) {
        // remove item from the shop
        await itemInStore.destroy();
      }else{
        itemInStore.itemQuantity -= amount;
        await itemInStore.save();
      }
      
    }
  } else {
    // Update the existing user inventory record
    userInventory.item_Amount += amount;
    await userInventory.save();

    // Check if the item quantity in the store is not infinite
    if (itemInStore.itemQuantity && itemInStore.itemQuantity > 0) {
      if (oldShopItemQuantity == 1) {
        // remove item from the shop
        await itemInStore.destroy();
      } else {
        itemInStore.itemQuantity -= amount;
        await itemInStore.save();
      }
    }
  }
  
  // Create a success response embed
  const successEmbed = new EmbedBuilder()
    .setColor(embedColors.GENERAL_COLORS.GREEN)
    .setTitle("Successful Buy")
    .setDescription(`You successfully bought "${itemName}" for ${totalPrice}$.`)
    .addFields(
      {
        name: `Item ${itemName} added:`,
        value: `${oldUserItem} + ${amount} = ${oldUserItem + amount}`,
      },
      {
        name: `New Balance: ${userBalance.user_balance_cash}`,
        value: `${oldUserBalance} - ${totalPrice} = ${userBalance.user_balance_cash}`,
      }
    )
    .setTimestamp();

  return successEmbed;
}