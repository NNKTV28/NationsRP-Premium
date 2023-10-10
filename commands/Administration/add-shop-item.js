const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Store = require('../../models/store');
const globals = require('../../utils/globals');
const color = require("colors")
const moment = require("moment");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-shop-item")
    .setDescription("Sets the welcome channel.")
    .addStringOption(itemOption => itemOption
        .setName('item')
        .setDescription('The item you want to add to the shop')
        .setRequired(true)
    )
    .addIntegerOption(PriceOption => PriceOption
        .setName('price')
        .setDescription('The price of the item')
        .setRequired(true)
    )
    .addIntegerOption(CuantityOption => CuantityOption
        .setName('cuantity')
        .setDescription('The cuantity of the item, set 0 for infinite')
        .setRequired(true)
    )
    .addStringOption(DescriptionOption => DescriptionOption
        .setName('description')
        .setDescription('The description of the item')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

    async execute(interaction) 
    {
        await interaction.deferReply({ ephemeral: true });
        
        const itemName = interaction.options.getString('item');
        const itemPrice = interaction.options.getInteger('price');
        const itemDescription = interaction.options.getString('description');
        const itemCuantity = interaction.options.getInteger('cuantity');

        const items = await Store.findAll({
            attributes: ['itemName', 'itemPrice', 'itemQuantity', 'itemDescription']
        });
        // Check if the item already exists
        const existingItem = items.find(item => item.itemName === itemName);
        if (existingItem) {
            try {
                interaction.editReply('That item already exists.');
            } catch (err) {
                console.log(err);
                globals.sendWebhookError(err, interaction);
            }
        } else {
            try {
                if(itemCuantity == 0){
                    await Store.create({
                        itemName: itemName,
                        itemCuantity: 0,
                        itemPrice: itemPrice,
                        itemDescription: itemDescription
                    })
                    interaction.editReply(`Added infinite ${itemName} to the shop.`);
                }else{
                    await Store.create({
                        itemName: itemName,
                        itemCuantity: itemCuantity,
                        itemPrice: itemPrice,
                        itemDescription: itemDescription
                    });
                    interaction.editReply(`Added ${itemCuantity} ${itemName} to the shop.`);
                }
                
            } catch (err) {
                globals.sendWebhookError(err);
                return console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[ADD SHOP ITEM ERROR]`)} ` + `${err}`.bgRed);
            }
        }
    },
};
