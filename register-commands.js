//https://discordjs.guide/creating-your-bot/command-deployment.html#guild-commands
const {REST, Routes} = require('discord.js');
const { clientId, token, guildId } = require('./config.json');
const fs = require('node:fs');
const path = require('path');

const commands = [];


// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const folders = fs.readdirSync(foldersPath);

// Grab all the command files from the commands directory you created earlier
for (const folder of folders) {
    const filePath = path.join(foldersPath, folder);
    const fileNames = fs.readdirSync(filePath).filter(file => file.endsWith('.js'))
    for (const file of fileNames) {
        const finalFilePath = path.join(filePath, file);
        const command = require(finalFilePath);
        if ('data' in command && 'execute' in command ) {
            commands.push(command.data.toJSON());
            console.log(commands);
        } else {
            console.log(`The command at ${finalFilePath} lacks either a data or execute property!`);
        }
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();