const {SlashCommandBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('botavatar')
    .setDescription('Shows the current avatar of the bot'),

    async execute (interaction) {
        interaction.reply(interaction.client.user.avatarURL())
    }
}