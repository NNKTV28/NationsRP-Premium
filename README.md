
# NationsRP Premium

Private discord economy bot for xarshmk



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

- Fully implemented slash commands
- Custom Shop and economy
- Scalable database for easy migration
- Full bug/error console and webhook log


## Support

For support, DM nnktv28 on discord or join our [Angel Development channel](https://discord.gg/RQ2NB2V9av).


## Authors

- [@NNKtv28](https://www.github.com/NNKTV28)

