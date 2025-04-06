const {SlashCommandBuilder, AttachmentBuilder} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder().setName('chiikawa').setDescription('Sends a random Chiikawa episode!'),

    async execute (interaction) {
        await interaction.deferReply();
        await interaction.followUp('Getting episode...');
        const deferredMessage = await interaction.fetchReply("@original"); //gets the deferred reply to delete it later
        const episode = await fetch('http://api.hermahs.com/chiikawa', {'Content-Type': 'video'}).then(response => response)
        if (!episode.ok) return interaction.followUp("Couldn't retrieve episode...")
        const contentType = episode.headers.get('content-type')
        const attachment = new AttachmentBuilder().setFile(episode.body).setName(`chiikawa.${contentType.split('/').pop()}`)
        await interaction.channel.send({content: '', files: [attachment]}) //sends the image to the channel without replying
        await deferredMessage.delete()
    }
}