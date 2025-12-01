
# NationsRP Premium

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Discord.js](https://img.shields.io/badge/discord.js-v14-blue.svg)](https://discord.js.org)
[![Node.js](https://img.shields.io/badge/node.js-v16+-green.svg)](https://nodejs.org)

A feature-rich Discord economy bot designed for roleplay servers. NationsRP Premium provides a complete virtual economy system with customizable shops, role-based income, inventory management, and administrative tools to create immersive economic experiences for your community.

## ✨ Highlights

- **💰 Full Economy System** - Virtual currency with deposits, withdrawals, and balance tracking
- **🛒 Custom Shop** - Create and manage server-specific shops with customizable items
- **📦 Inventory Management** - Users can purchase, store, and use items from the shop
- **💼 Role-Based Income** - Assign passive income to specific server roles
- **🎭 Item Income Roles** - Grant income bonuses through special items
- **🏴 Black Market** - Special marketplace for exclusive items
- **🎫 Ticket System** - Built-in support ticket functionality
- **📊 Leaderboards** - Track top earners with the baltop command
- **🔧 Admin Controls** - Comprehensive tools for server administrators
- **📝 Full Logging** - Console and webhook logging for errors and database events



## Table of Contents

1. [Roadmap](#Roadmap)
2. [How to run the bot locally](#Run-locally)
3. [How to deploy the bot in a server](#Deployment)
4. [Slash command structure](#Command-Structure)
5. [Environment Variables](#Environment-Variables)
6. [Bot Features](#Features)
7. [Support](#Support)
8. [Author](#Author)
## Roadmap

- Fix balance and item income roles
- Fix /redeem command
- Fix Ticket system (Ticket buttons dont work)
- Implement back the /role-income-list command
- Implement /use (this command allows to use a shop item which would activate the role given or role required feature of that specific item)

## Run Locally

Clone the project

```bash
  git clone https://github.com/NNKTV28/NationsRP-Premium.git
```

Go to the project directory

```bash
  cd NationsRP-Premium
```

Install dependencies

```bash
  npm install || npm i
```

Deploy commands

```bash
  node .\deploy-commands.js
```

Start the server

```bash
  node index.js
```

# Optional Steps

## Synchronize Database:
Once executed
```bash
  node index.js
```

Stop the bot and run:

```bash
  node .\utils\syncDB.js
```


## Deployment

To deploy this project run

```bash
  npm i
  node deploy-commands.js
  node synch-db.js
  node index.js
```


## Command Structure

```javascript

const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');// Required to import discord.js modules
const Balance = require('../../models/balance'); // Example of importing a model, required if needed to make changes/display the selected database table
const globals = require("../../utils/globals.js"); // Required for some variables like global emojis
const color = require("colors"); // required for console output colors
const moment = require("moment"); // required for console output colors 

module.exports = {
    // Slash command data (required)
    data: new SlashCommandBuilder()
      .setName("comand-name") // must be lower case
      .setDescription("Command description") // Command description
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Allows the command to be used only by people with an Admin role
      .setDMPermission(false), // Allows the command to be used in DMs
    
    
    async execute(interaction) {
        // Make the bot reply to only be seen by the user who used the command
      await interaction.deferReply({ ephemeral: true });
        // try to execute, if any error, log it, best way to avoid bot crash
      try {
        
      } catch (err) {
          // Log any errors through the console
        console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[COMMAND ERROR]`)} ` + `${err}`.bgRed);
      }
    }
}
```


## Environment Variables

To run this project, you will need to add the following environment variables to your files:
- @root/.env:

Bot token (required): `BOT_token`

- @root/config.json

Bot token (required): `token`

Database log webhook (required): `databaseLogWebhookURL`

Error log webhook (required): `errorWebhookURL`  

User Issue report webhook (required): `issueWebhookURL`

Client ID (required): `clientId`   

Public Aplication key (required): `publicKEY`  

Discord User id of the Owner (optional): `ownerIDS`  

Color for Embeds: `embedColor`

## Features

### 💰 Economy Commands
| Command | Description |
|---------|-------------|
| `/balance` | Check your current balance |
| `/baltop` | View the server's top earners |
| `/deposit` | Deposit cash to your bank |
| `/withdraw` | Withdraw cash from your bank |
| `/shop` | Browse available items for purchase |
| `/buy` | Purchase items from the shop |
| `/view-inventory` | View your purchased items |
| `/use` | Use an item from your inventory |
| `/item-info` | Get detailed information about an item |
| `/black-market` | Access the exclusive black market |

### 🔧 Administration Commands
| Command | Description |
|---------|-------------|
| `/add-balance` | Add balance to a user |
| `/remove-balance` | Remove balance from a user |
| `/add-shop-item` | Create a new shop item |
| `/edit-shop-item` | Modify an existing shop item |
| `/remove-shop-item` | Delete a shop item |
| `/give-user-item` | Give an item directly to a user |
| `/take-item` | Remove an item from a user |
| `/add-income-role` | Set up passive income for a role |
| `/remove-income-role` | Remove income from a role |
| `/add-item-income-role` | Set up item-based income |
| `/remove-income-item-role` | Remove item-based income |
| `/admin-settings` | Configure bot settings |
| `/synch-db` | Synchronize the database |
| `/reload-commands` | Reload bot commands |

### ℹ️ Info Commands
| Command | Description |
|---------|-------------|
| `/info` | Display bot information |
| `/ping` | Check bot latency |
| `/uptime` | View bot uptime |
| `/report-issue` | Report bugs or issues |

### 🏗️ Technical Features
- **Slash Commands** - Modern Discord slash command implementation
- **SQLite Database** - Lightweight and scalable data storage using Sequelize ORM
- **Modular Architecture** - Organized command and event structure
- **Error Handling** - Comprehensive error logging via console and webhooks
- **PM2 Support** - Production-ready with ecosystem.config.js


## Support

For support, DM nnktv28 on discord or join our [Aurora Development](https://discord.gg/RQ2NB2V9av).
## Aditional Info
- This bot has been discontinued, since the client doesnt need it anymore
- The bot token is useless, as the bot no longer exists

## Authors

- [@NNKtv28](https://www.github.com/NNKTV28)

