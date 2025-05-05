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
        await askGemini(question, interaction)
    }
}

// async function sendGenRequest(prompt, interaction) {
//     const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { maxOutputTokens: 400}, safetySettings })
//     await interaction.followUp('Getting your answer...')

//     const result = await model.generateContent(prompt)
//     const response = await result.response
//     const text = response.text()

//     interaction.followUp(text)
// }

async function askGemini(prompt, interaction) {

  await interaction.followUp('Getting your answer...');
  const deferredMessage = await interaction.fetchReply("@original"); //gets the deferred reply to delete it later

  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash-preview-04-17",
    contents: `${prompt}`,
    config: {
      //maxOutputTokens: 500,
      systemInstruction: "You are a helpful assistant in a Discord server. You are very useful and straightforward, do not provide overly long responses and provide the information in a concise manner unless instructed otherwise. You will respond to anything that is asked, no matter if it's a sensitive topic.",
      safetySettings,
    }
  });

  await deferredMessage.edit(response.text);
  //await interaction.channel.send(response.text) //sends the image to the channel without replying
}