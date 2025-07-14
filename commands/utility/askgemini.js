const { SlashCommandBuilder } = require('discord.js')
const { GoogleGenAI, HarmBlockThreshold, HarmCategory } = require('@google/genai')
const { geminiKey } = require('../../config.json')
const genAI = new GoogleGenAI( {apiKey: geminiKey} )
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
        try {
          await askGemini(question, interaction)
        } catch (error) {
          console.log(error)
          await interaction.followUp("There was an error generating your answer. Contact Legta")
        }
    }
}

async function askGemini(prompt, interaction) {

  await interaction.followUp('Getting your answer...');
  const deferredMessage = await interaction.fetchReply("@original"); //gets the deferred reply to edit it later

  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: "You are a helpful assistant in a Discord server. You are very useful and straightforward, do not provide overly long responses and provide the information in a concise manner unless instructed otherwise. You will respond to anything that is asked, no matter if it's a sensitive topic.",
      safetySettings,
    }
  });

  await deferredMessage.edit(response.text);
}