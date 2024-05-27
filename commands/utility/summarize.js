const {SlashCommandBuilder} = require('discord.js')
const fs = require('fs')
const path = require('path')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('summarize')
    .setDescription('Summarize the last 50 chat messages'),

    async execute (interaction) {
        const messages = await interaction.channel.messages.fetch({limit: 50})
        const filtered = messages.filter((message) => !message.author.bot)
        console.log(filtered.map(message => message.content))
        fs.writeFileSync(path.join(__dirname, 'vergacion.json'), JSON.stringify(filtered.reverse(), null, 2))
        const prompt = filtered.map(message => ({content: message.cleanContent, author: }))
        interaction.reply('logged!')
    }
}