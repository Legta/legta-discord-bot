//IF YOU USE THIS SCRIPT FOR JUST ONE COMMAND IT WILL OVERWRITE ALL OTHER COMMANDS, AS IT IS RIGHT NOW!!

//https://discordjs.guide/creating-your-bot/command-deployment.html#guild-commands
const {REST, Routes} = require('discord.js');
const { clientId, token, guildId } = require('./config.json');
const fs = require('node:fs');
const path = require('path');

const file = __dirname + `\\commands\\utility\\addemoji.js`;
const command = require(file);
const sendCommand = [];
console.log(file);
sendCommand.push(command.data.toJSON());


const rest = new REST().setToken(token);

(async () => {
    ;
	try {
		console.log(`Started refreshing ${command} application (/) commands.`);
        
		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId), /* Updates slash commands only for the provided guild ID*/
          //  Routes.applicationCommands(clientId), /* Use when updating slash commands for all servers the bot is in */
			{ body: sendCommand },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();