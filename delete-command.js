const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');

const rest = new REST().setToken(token);

// ...

// for guild-based commands
rest.delete(Routes.applicationGuildCommand(clientId, guildId, '1203415022093598740'))
	.then(() => console.log('Successfully deleted guild command'))
	.catch(console.error);

// // for global commands
// rest.delete(Routes.applicationCommand(clientId, 'commandId'))
// 	.then(() => console.log('Successfully deleted application command'))
// 	.catch(console.error);