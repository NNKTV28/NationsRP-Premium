const sqlite3 = require('sqlite3').verbose();
const { WebhookClient } = require('discord.js');
const { databaseLogWebhookURL  } = require('../config.json');
const moment = require('moment');
const color = require('colors');
const dbPath = 'MainDB.sqlite'; // Path to your SQLite database file


const webhook = new WebhookClient({ url: databaseLogWebhookURL });

async function connectToDatabase() {
  const db = new sqlite3.Database(dbPath);

  try {
    console.log(`${color.bold.yellow(`[DATABASE HANDLER] Database >> SQLite is connecting...`)} `);
    const startTime = performance.now(); // Start measuring time

    // Open the SQLite database
    db.serialize(() => {
      db.run("PRAGMA foreign_keys=ON"); // Enable foreign keys (optional)

      const endTime = performance.now(); // Stop measuring time
      const latency = endTime - startTime; // Calculate latency in milliseconds

      console.log(`${color.bold.green(`[DATABASE HANDLER] Database >> SQLite is ready! (Latency: ${latency.toFixed(2)} ms`)} `);
      // If the connection is successful, send a message to the webhook

      webhook.send(`Database >> SQLite is ready! (Latency: ${latency.toFixed(2)} ms)`);
    });

  } catch (err) {
    console.error(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[DATABASE CONNECTION ERROR]`)} ` + `${err}`.bgRed);
    // If there's an err, send an err message to the webhook
    webhook.send(`[ERROR] >> SQLite >> Failed to connect to SQLite! >> Error: ${err}`);
  }
}

module.exports = connectToDatabase();