import { fetchDefamation } from "#functions";

import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder, TextChannel } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder().setName('defamation').setDescription('Shows a random hermahs defamation'),
    async execute (interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();
        await interaction.followUp('Defamating rn...');
        const deferredMessage = await interaction.fetchReply("@original"); //gets the deferred reply to delete it later
        const attachment: AttachmentBuilder | null = await fetchDefamation()
        if (attachment) {
            await (interaction.channel as TextChannel).send({content: '', files: [attachment]}) //sends the image to the channel without replying
        }
        await deferredMessage.delete()
    }
}