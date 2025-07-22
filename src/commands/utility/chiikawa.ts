import { SlashCommandBuilder, AttachmentBuilder, ChatInputCommandInteraction, TextChannel } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder().setName('chiikawa').setDescription('Sends a random Chiikawa episode!'),

    async execute (interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();
        await interaction.followUp('Getting episode...');
        const deferredMessage = await interaction.fetchReply("@original"); //gets the deferred reply to delete it later
        const episode = await fetch('https://api.hermahs.com/chiikawa')
        if (!episode.ok) return interaction.followUp("Couldn't retrieve episode...")
        const contentType = episode.headers.get('content-type')
        const file = Buffer.from(await episode.arrayBuffer())
        const attachment = new AttachmentBuilder(file).setName(`chiikawa.${contentType?.split('/').pop()}`)
        if (interaction.channel?.isTextBased()) {

            await (interaction.channel as TextChannel).send({content: '', files: [attachment]}) //sends the image to the channel without replying
        }
        await deferredMessage.delete()
    }
}