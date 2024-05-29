const { SlashCommandBuilder } = require('discord.js')
const { awanLLMKey } = require('../../config.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ask')
        .setDescription('Ask something to an AI')
        .addStringOption((option) => option.setName('prompt').setRequired(true).setDescription('What do you want to ask?')),

    async execute(interaction) {
        interaction.deferReply()
        const question = interaction.options.getString('prompt')
        await sendGenRequest(question, interaction)
        interaction.followUp('Getting your answer...')
    }
}

async function sendGenRequest(prompt, interaction) {
    const chatGPTApi = 'https://api.awanllm.com/v1/chat/completions'
    const headers = {
        'Content-type': 'application/json',
        'Authorization': 'Bearer ' + awanLLMKey
    }
    const body = JSON.stringify({
        "model": "Awanllm-Llama-3-8B-Dolfin",
        "messages": [{"role": "user", "content": `${prompt}`}],
        "temperature": 0.7
      })

    const request = await fetch(chatGPTApi, {
        method: 'POST',
        headers,
        body
    })
    const response = await request.json()
    interaction.followUp(response.choices[0].message)
}