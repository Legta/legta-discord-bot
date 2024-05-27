const { SlashCommandBuilder } = require('discord.js')
const hordeApi = 'https://stablehorde.net/api/v2/'
const { hordeKey } = require('../../config.json')
// const fs = require('fs')
// const path = require('path')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('summarize')
        .setDescription('Summarize the last 50 chat messages (excluding bots)'),

    async execute(interaction) {
        interaction.deferReply()
        const messages = await interaction.channel.messages.fetch({ limit: 50 })
        const filtered = messages.filter((message) => !message.author.bot)
        const prompt = filtered.map(message => ({ content: message.cleanContent, author: message.author.username }))
        const generationRequest = await sendGenRequest(prompt)
        const finalText = await getFinalText(generationRequest)
        console.log(JSON.stringify(prompt))
        await interaction.editReply(finalText.text)
    }
}

async function sendGenRequest(messages) {
    const summarization = await fetch(hordeApi + 'generate/text/async', {
        method: 'POST',
        headers: { 'apikey': hordeKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "prompt": `This is data from a chat, every message is represented as a key:value pair where author is the user who sent the message and content is the content of the message, please summarize the conversation in one paragraph.
            Respond ONLY with the summarization. Message data: ${messages}`,
            "params": {
                "n": 1,
                "frmtadsnsp": false,
                "frmtrmblln": false,
                "frmtrmspch": false,
                "frmttriminc": false,
                "max_context_length": 1024,
                "max_length": 160,
                "rep_pen": 1.1,
                "rep_pen_range": 4096,
                "rep_pen_slope": 10,
                "singleline": false,
                "temperature": 0.7,
                "tfs": 1,
                "top_a": 1,
                "top_k": 100,
                "top_p": 1,
                "typical": 1,
                // "sampler_order": [
                //     0
                // ],
                "use_default_badwordsids": true,
                // "stop_sequence": [
                //   "string"
                // ],
                "min_p": 0,
                "smoothing_factor": 0,
                "dynatemp_range": 0,
                "dynatemp_exponent": 1
            },
            //   "softprompt": "string",
            "trusted_workers": false,
            "slow_workers": false,
            "worker_blacklist": false,
            //   "models": [
            // "string"
            //   ],
            "dry_run": false,
            "disable_batching": false,
            "allow_downgrade": false,
        })
    }).then(response => response.json()).then(result => result)
    const generationId = summarization.id
    return generationId
}

async function getFinalText(genId) {
    const interval = setInterval(async () => {
        const status = await fetch(hordeApi + `generate/text/status/${genId}`).then(response => response.json()).then(result => result)
        if (status.done) {
            console.log(status)
            clearInterval(interval)
            return status.generations
        }
        console.log(`Generating text... ${hordeApi}generate/text/status/${genId}`, status)
    }, 1000)
}