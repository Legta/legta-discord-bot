import type { ChatInputCommandInteraction, TextChannel, SlashCommandStringOption } from "discord.js";

const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Talk as the bot.")
    .addStringOption((option: SlashCommandStringOption) => option.setName('say').setRequired(true).setDescription('What do you want to say?')),

    async execute (interaction: ChatInputCommandInteraction) {
        const userMessage = interaction.options.getString("say")
        try {
            const deferred = await interaction.deferReply({flags: MessageFlags.Ephemeral})
            await (interaction.channel as TextChannel).send(userMessage ? userMessage : "")
            await deferred.delete()
        } catch (error) {
            await interaction.reply({content: "There was an issue sending the command.", flags: MessageFlags.Ephemeral})
        }
    }
    
}