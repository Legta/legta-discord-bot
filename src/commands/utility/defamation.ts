import { fetchDefamation } from "#functions";

import { SlashCommandBuilder } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder().setName('defamation').setDescription('Shows a random hermahs defamation'),
    async execute (interaction: any) {
        await interaction.deferReply();
        await interaction.followUp('Defamating rn...');
        const deferredMessage = await interaction.fetchReply("@original"); //gets the deferred reply to delete it later
        const attachment = await fetchDefamation()
        await interaction.channel.send({content: '', files: [attachment]}) //sends the image to the channel without replying
        await deferredMessage.delete()
    }
}