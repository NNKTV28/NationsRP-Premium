const BalanceModel = require('../models/balance');
const GuildModel = require('../models/guild');
const color = require("colors");
const moment = require("moment");

module.exports = {
  name: "guildMemberAdd",
  
  async execute(member) {
    try {
      const guild = await GuildModel.findOne({
        where: { guild_id: member.guild.id },
      });
  
      const userBalance = await BalanceModel.findOne({
        where: { user_id: member.id },
      });

      const WelcomeChannel = guild.welcomeChannelID;
      const WelcomeMessage = guild.welcomeMessage;
      const welcomeRole = guild.welcomeRoleID;

      console.log(`Welcome channel: ${WelcomeChannel} \nWelcome message: ${WelcomeMessage} \n WelcomeRole: ${welcomeRole}`);
      
      if(!WelcomeChannel) {
        console.log("No welcome channel found");
        return;  
      } else {
        if(!WelcomeMessage) {
          // Check if the user already has a balance entry (if not, create one)
          if (!userBalance) {
            // Create a new balance entry with default values
            await BalanceModel.create({
              user_id: member.id,
              user_balance_cash: 1000,
              user_balance_bank: 1000,
            });
          }
          
          // Give role to user
          if(welcomeRole) {
            member.roles.add(welcomeRole.toString());
          }
          
          // Get the channel object from the channel ID
          const channel = member.guild.channels.cache.get(WelcomeChannel);
          
          if(channel) {
            const welcomeMessage = `Welcome to the server! ${member.user.username}`;
            channel.send(welcomeMessage);
          } else {
            console.log("Invalid welcome channel");
          }
        }else{
          try 
          {  
            if (user.user.bot)
            {
              return;
            }else{
              // Check if the user already has a balance entry (if not, create one)
              if (!userBalance) {
                // Create a new balance entry with default values
                await BalanceModel.create({
                  user_id: member.id,
                  user_balance_cash: 0,
                  user_balance_bank: 0,
                });
              }

              // Give role to user
              if(welcomeRole) {
                member.roles.add(welcomeRole.toString());
              }

              // Get the channel object from the channel ID
              const channel = member.guild.channels.cache.get(WelcomeChannel);

              if(channel) {
                const welcomeMessage = `${guild.welcomeMessage}`;
                channel.send(welcomeMessage);
              } else {
                console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[INVALID WELCOME CHANNEL]`)} `);
              }
            }
          } catch (err) {
            console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[GUILD MEMBER ADD ERROR]`)} ` + `${err}`.bgRed);
          }

        }
      }      
    } catch (err) {
      console.log(`${color.bold.bgBlue(`[${moment().format("dddd - DD/MM/YYYY - hh:mm:ss", true)}]`)} ` + `${color.bold.red(`[GUILD MEMBER ADD ERROR]`)} ` + `${err}`.bgRed);
    }
  }
};