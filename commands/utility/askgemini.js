const { SlashCommandBuilder } = require('discord.js')
const { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } = require('@google/generative-ai')
const { geminiKey } = require('../../config.json')
const genAI = new GoogleGenerativeAI(geminiKey)
const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE
    }
]

module.exports = {
    data: new SlashCommandBuilder()
        .setName('askgemini')
        .setDescription('Ask something to Google Gemini')
        .addStringOption((option) => option.setName('prompt').setRequired(true).setDescription('What do you want to ask?')),

    async execute(interaction) {
        await interaction.deferReply()
        const question = interaction.options.getString('prompt')
        await sendGenRequest(question, interaction)
    }
}

async function sendGenRequest(prompt, interaction) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { maxOutputTokens: 400}, safetySettings })
    await interaction.followUp('Getting your answer...')

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    interaction.followUp(text)
}