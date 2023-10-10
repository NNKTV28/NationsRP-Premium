const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Store = require('../../models/store');
const globals = require("../../utils/globals.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("edit-shop-item")
    .setDescription("Edits an existing item in the shop.")
    .addStringOption(itemOption => itemOption
        .setName('item')
        .setDescription('The item you want to edit in the shop')
        .setRequired(true)
    )
    .addIntegerOption(PriceOption => PriceOption
        .setName('price')
        .setDescription('The new price of the item')
        .setRequired(false)
    )
    .addStringOption(DescriptionOption => DescriptionOption
        .setName('description')
        .setDescription('The new description of the item')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

    async execute(interaction) 
    {
        await interaction.deferReply({ ephemeral: true });
        
        const itemName = interaction.options.getString('item');
        const itemPrice = interaction.options.getInteger('price');
        const itemDescription = interaction.options.getString('description');

        const item = await Store.findOne({
            where: {
                itemName: itemName
            }
        });

        // Check if the item exists
        if (item) {
            try {
                if (itemPrice) {
                    item.itemPrice = itemPrice;
                }
                if (itemDescription) {
                    item.itemDescription = itemDescription;
                }
                await item.save();
                interaction.editReply('Item edited successfully.');
            } catch (err) {
                console.log(err);
                globals.sendWebhookError(err, interaction);
            }
        } else {
            try {
                interaction.editReply('That item does not exist.');
            } catch (err) {
                console.log(err);
                globals.sendWebhookError(err, interaction);
            }
        }
    },
};