const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Store = require('../../models/store');
const globals = require('../../utils/globals');
const color = require("colors")
const moment = require("moment");
const UserSettingsModel = require("../../models/usersettings.js");
const embedColor = require("../../utils/colors");

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
    .addRoleOption(RoleToBuyOption => RoleToBuyOption
        .setName('role-to-buy')
        .setDescription('The necesary role to be able to buy the item (can be null)')
        .setRequired(false)
    )
    .addRoleOption(RoleToUseOption => RoleToUseOption
        .setName('role-to-use')
        .setDescription('The necesary role to be able to use the item (can be null)')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

    async execute(interaction) 
    {
        const guildID = interaction.guild.id;
        let userRecord = await UserSettingsModel.findOne({
            where: { user_id: interaction.user.id },
        });
        await interaction.deferReply({ ephemeral: userRecord.ephemeral_message });
        
        let itemName = interaction.options.getString('item');
        let itemPrice = interaction.options.getInteger('price');
        let itemDescription = interaction.options.getString('description');
        let itemQuantity = interaction.options.getInteger('cuantity');
        let roleToBuy = interaction.options.getRole('role-to-buy');
        let roleToUse = interaction.options.getRole('role-to-use');
        
        if(!roleToBuy){
            roleToBuy = guildID
        }else{
            roleToBuy = roleToBuy.id
        }
        if(!roleToUse){
            roleToUse = guildID
        }else{
            roleToUse = roleToUse.id
        }

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
                if(itemQuantity == 0){
                    await Store.create({
                        itemName: itemName,
                        itemQuantity: 0,
                        itemPrice: itemPrice,
                        itemDescription: itemDescription,
                        role_to_buy: roleToBuy,
                        role_to_use: roleToUse
                    })
                    
                    itemQuantity = "Infinite"
                    const addedItemEmbed = new EmbedBuilder()
                        .setTitle(`Added infinite ${itemName} to the shop.`)
                        .setColor(embedColor.GENERAL_COLORS.GREEN)
                        .setDescription(`**Price:** ${itemPrice}$\n **Quantity:** ${itemQuantity} \n **Role to buy:** ${roleToBuy} \n **Role to use:** ${roleToUse}`)
                    interaction.editReply({embeds: [addedItemEmbed]});
                }else{
                    await Store.create({
                        itemName: itemName,
                        itemQuantity: itemQuantity,
                        itemPrice: itemPrice,
                        itemDescription: itemDescription,
                        role_to_buy: roleToBuy,
                        role_to_use: roleToUse
                    });
                    
                    const addedItemEmbed = new EmbedBuilder()
                        .setTitle(`Added ${itemQuantity} ${itemName} to the shop.`)
                        .setColor(embedColor.GENERAL_COLORS.GREEN)
                        .setDescription(`Price: ${itemPrice} \n **Quantity:** ${itemQuantity} \n Role to buy: ${roleToBuy} \n Role to use: ${roleToUse}`)
                    interaction.editReply({embeds: [addedItemEmbed]});
                }
                
            } catch (err) {
                globals.sendWebhookError(err);
                const errorEmbed = new EmbedBuilder()
                    .setColor(`${embedColor.GENERAL_COLORS.RED}`)
                    .setTitle("Redeem Error")
                    .setDescription("An err occurred while redeeming.")
                    .addFields({ name: "Error:", value: `${err}` });
                await interaction.editReply({ embeds: [errorEmbed] });
                console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[ADD SHOP ITEM ERROR]`)} ` + `${err}`.bgRed);
            }
        }
    },
};
