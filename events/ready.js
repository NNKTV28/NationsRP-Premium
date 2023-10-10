const { Events, ActivityType } = require("discord.js");
const color = require("colors");
const moment = require("moment");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    //console.log(`Logged in as ${client.user.tag}.`);
    console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.green(`[Logged in as - ${client.user.tag}]`)} `);
    client.user.setPresence({
      activities: [{ name: `/commands`, type: ActivityType.Watching }],
      status: "online",
    });
  },
};
