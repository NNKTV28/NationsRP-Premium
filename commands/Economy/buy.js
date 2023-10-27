const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
} = require("discord.js");
const embedColors = require("../../utils/colors.js");
const Store = require("../../models/store");
const BalanceModel = require("../../models/balance");
const Inventory = require("../../models/inventory");
const UserSettingsModel = require("../../models/usersettings.js");

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

        if (response.error) {
          const errorEmbed = new EmbedBuilder()
            .setColor(`${embedColors.GENERAL_COLORS.RED}`)
            .setTitle("Error")
            .setDescription(response.error);
          return interaction.editReply({ embeds: [errorEmbed] });
        }

        return interaction.editReply({ embeds: [response.embed] });
      }
    } catch (error) {
      console.error(error);
      interaction.editReply("An error occurred while processing your purchase.");
    }
  },
};

async function processBuyAction(userId, itemName, amount, roleId) {
  const userBalance = await BalanceModel.findOne({
    where: { user_id: userId },
  });

  if (!userBalance) {
    return { error: "User balance not found." };
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
    return { error: `Item "${itemName}" does not exist in the shop.` };
  }

  if (amount === 0) {
    return { error: "Amount must be greater than 0." };
  }

  if (amount > itemInStore.itemQuantity) {
    return {
      error: `There isn't enough of this item in the store. Currently, there's only ${itemInStore.itemQuantity} ${itemName} left`,
    };
  }

  if (userBalance.user_balance_cash < itemInStore.itemPrice * amount) {
    return { error: "You don't have enough cash to buy this item." };
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


/*const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
} = require("discord.js");
const embedColors = require("../../utils/colors.js");
const Store = require("../../models/store");
const BalanceModel = require("../../models/balance");
const Inventory = require("../../models/inventory");
const UserSettingsModel = require("../../models/usersettings.js");

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
        // Get the user's balance
        const userBalance = await BalanceModel.findOne({
          where: { user_id: userId },
        });
        const matchingBuyRoles = await Store.findOne({
          where: { itemName: itemName, role_to_use: roleId },
        });

        if (!matchingBuyRoles) {

          const noBuyRole = new EmbedBuilder()
            .setColor(`${embedColors.GENERAL_COLORS.RED}`)
            .setTitle("Not Allowed")
            .setDescription("You dont own a valid role to buy the item.")
            .addFields({
              name: `Item not bought: ${itemName}`,
              value: `You dont own a valid role to buy the item.`,
            });
          return interaction.editReply({ embeds: [noBuyRole] });
        }

        // Check if the item exists in the shop
        const itemInStore = await Store.findOne({
          where: { itemName: itemName },
        });

        if (!itemInStore) {
          return interaction.editReply(
            `Item "${itemName}" does not exist in the shop.`
          );
        }

        if (amount === 0) {
          return interaction.editReply(`Amount must be greater than 0.`);
        }
        if (amount > itemInStore.itemCuantity) {
          return interaction.editReply(
            `There isnt enough of this item in the store. Currently theres only ${itemInStore.itemCuantity} ${itemName} left`
          );
        }

        // Check if the user has enough cash to buy the item
        if (userBalance.user_balance_cash < itemInStore.itemPrice * amount) {
          return interaction.editReply(
            `You don't have enough cash to buy this item.`
          );
        }
        const oldUserBalance = userBalance.user_balance_cash;
        // Deduct the item price from the user's cash balance
        userBalance.user_balance_cash -= itemInStore.itemPrice * amount;

        // Create or update the user's inventory for the purchased item
        const userInventory = await Inventory.findOne({
          where: { user_id: userId, item_Name: itemName },
        });
        const oldUserItem = userInventory ? userInventory.item_Amount : 0;

        if (!userInventory || userInventory.length == 0) {
          // If the item is not in the inventory, create a new entry
          userInventory = await Inventory.create({
            user_id: userId,
            item_Name: itemName,
            item_Amount: amount, // Assuming you start with one of the purchased item
            role_to_use: itemInStore.role_to_use,
          });
          if (itemInStore.itemCuantity > 0) {
            itemInStore.itemCuantity -= amount;
            await itemInStore.save();
          }
        } else {
          // If the item is already in the inventory, increment the amount
          userInventory.item_Amount += amount;
          await userInventory.save();

          if (itemInStore.itemCuantity === null) {
            console.log("Item is infinite");
          } else {
            itemInStore.itemCuantity -= amount;
            await itemInStore.save();
          }
        }
        // Save the updated balance
        await userBalance.save();
        const succesfulBuyEmbed = new EmbedBuilder()
          .setColor(embedColors.GENERAL_COLORS.GREEN)
          .setTitle("Successful Buy")
          .setDescription(
            `You successfully bought "${itemName}" for ${itemInStore.itemPrice}$.`
          )
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
        return interaction.editReply({ embeds: [succesfulBuyEmbed] });
      }
    } catch (error) {
      console.error(error);
      interaction.editReply(
        "An error occurred while processing your purchase."
      );
    }
  },
};

function removeItemFromStore(itemName, amount) {
  Store.findOne({ where: { itemName: itemName } }).then((item) => {
    if (item) {
      item.itemCuantity -= amount;
      item.save();
    }
  });
}

function buyItem(){
  Store.findOne({ where: { itemName: itemName } }).then((item) => {
    if (item) {
      item.itemCuantity -= amount;
      item.save();
    }
  });
  BalanceModel.findOne({ where: { user_id: userId } }).then((user) => {
    if (user) {
      user.user_balance_cash -= itemInStore.itemPrice * amount;
      user.save();
    }
  });
  Inventory.findOne({ where: { user_id: user.id, item_Name: itemName } })
    .then((item) => {
      if (item) {
        item.item_Amount += amount;
        item.save();
      }
    })
    .catch((err) => {
      console.error(err);
    })
}
*/
