const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const Store = require('../../models/store');
const BalanceModel = require('../../models/balance');
const Inventory = require('../../models/inventory');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("buy")
    .setDescription("Buy an item from the shop.")
    .addStringOption(option => option
      .setName('item')
      .setDescription('The item you want to buy')
      .setRequired(true)
    )
    .addIntegerOption(option => option
      .setName('amount')
      .setDescription('The amount of the item you want to buy')
      .setRequired(true)
    )
    .setDMPermission(false),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const user = interaction.user;
    const itemName = interaction.options.getString('item');
    const amount = interaction.options.getInteger('amount');
    try {

      // Check if the item exists in the shop
      const item = await Store.findOne({
        where: { itemName: itemName },
      });
      const itemAmmountInStore = await Store.findOne({
        where: { itemName: itemName },
      });

      if (!item) {
        return interaction.editReply(`Item "${itemName}" does not exist in the shop.`);
      }

      if(amount === 0)
      {
        return interaction.editReply(`Amount must be greater than 0.`);
      }

      // Get the user's balance
      let userBalance = await BalanceModel.findOne({
        where: { user_id: user.id },
      });

      if (!userBalance) {
        // If the user's balance doesn't exist, create it with an initial balance of 0
        userBalance = await BalanceModel.create({
          user_id: user.id,
          user_balance_cash: 0,
        });
      }
      if(amount > itemAmmountInStore.itemCuantity)
      {
        return interaction.editReply(`There isnt enough of this item in the store. Currently theres only ${itemAmmountInStore.itemCuantity} ${itemName} left`);
      }

      // Check if the user has enough cash to buy the item
      if (userBalance.user_balance_cash < item.itemPrice * amount) {
        return interaction.editReply(`You don't have enough cash to buy this item.`);
      }

      // Deduct the item price from the user's cash balance
      userBalance.user_balance_cash -= item.itemPrice * amount;

      // Create or update the user's inventory for the purchased item
      let userInventory = await Inventory.findOne({
        where: { user_id: user.id, item_Name: itemName },
      });

      if (!userInventory) {
        // If the item is not in the inventory, create a new entry
        userInventory = await Inventory.create({
          user_id: user.id,
          item_Name: itemName,
          item_Amount: amount, // Assuming you start with one of the purchased item
        });
        if(itemAmmountInStore.itemCuantity === 0)
        {
          console.log("Item is infinite");
        }else
        {
          itemAmmountInStore.itemCuantity -= amount;
          await itemAmmountInStore.save();
        }
      } else {
        // If the item is already in the inventory, increment the amount
        userInventory.item_Amount += amount;
        await userInventory.save();
        if(itemAmmountInStore.itemCuantity === 0)
        {
          console.log("Item is infinite");
        }else
        {
          itemAmmountInStore.itemCuantity -= amount;
          await itemAmmountInStore.save();
        }
      }
      // Save the updated balance
      await userBalance.save();
      interaction.editReply(`You successfully bought "${itemName}" for ${item.itemPrice}$.`);

    } catch (error) {
      console.error(error);
      interaction.editReply('An error occurred while processing your purchase.');
    }
  },
};
