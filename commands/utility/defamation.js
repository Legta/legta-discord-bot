const {SlashCommandBuilder, AttachmentBuilder} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder().setName('defamation').setDescription('Shows a random hermahs defamation'),

    async execute (interaction) {
        await interaction.deferReply();
        await interaction.followUp('Defamating rn...');
        const deferredMessage = await interaction.fetchReply("@original"); //gets the deferred reply to delete it later
        const image = await fetch('http://api.hermahs.com/defamation', {'Content-Type': 'image'}).then(response => response)
        if (!image.ok) return interaction.followUp("Couldn't retrieve image...")
        const contentType = image.headers.get('content-type')
        const attachment = new AttachmentBuilder().setFile(image.body).setName(`hermahs_defamation.${contentType.split('/').pop()}`)
        await interaction.channel.send({content: '', files: [attachment]}) //sends the image to the channel without replying
        await deferredMessage.delete()
    }
}