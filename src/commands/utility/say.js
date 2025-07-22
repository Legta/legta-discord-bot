const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Talk as the bot.")
    .addStringOption((option) => option.setName('say').setRequired(true).setDescription('What do you want to say?')),

    async execute (interaction) {
        const userMessage = interaction.options.getString("say")
        try {
            const deferred = await interaction.deferReply({flags: MessageFlags.Ephemeral})
            await interaction.channel.send(userMessage)
            await deferred.delete()
        } catch (error) {
            await interaction.reply({content: "There was an issue sending the command.", flags: MessageFlags.Ephemeral})
        }
    }
    
}