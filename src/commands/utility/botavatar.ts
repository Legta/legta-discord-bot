import { ChatInputCommandInteraction } from "discord.js";

const {SlashCommandBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('botavatar')
    .setDescription('Shows the current avatar of the bot'),

    async execute (interaction: ChatInputCommandInteraction) {
        const userAvatarURL: string | null = interaction.client.user.avatarURL()
        if (userAvatarURL) {
            await interaction.reply(userAvatarURL)
        }
    }
}