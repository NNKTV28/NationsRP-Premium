
# NationsRP Premium

Private discord economy bot for xarshmk



## Table of Contents

1. [Roadmap](#Roadmap)
2. [How to run the bot locally](#Run-locally)
3. [How to deploy the bot in a server](#Deployment)
4. [Environment Variables](#Environment-Variables)
## Roadmap

- Fix balance and item income roles
- Fix /redeem command
- Fix Ticket system (Ticket buttons dont work)
- Implement back the /role-income-list command


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

