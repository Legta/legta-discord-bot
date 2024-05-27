/*

This is abandoned because I could not get the output to be consistent, it would return gibberish or always have weird stuff like cut off sentences, be too slow, etc.

*/

const { SlashCommandBuilder } = require('discord.js')
const hordeApi = 'https://stablehorde.net/api/v2/'
const { hordeKey } = require('../../../config.json')
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
        console.log(`Data to send: ${JSON.stringify(prompt)}`)
        const generationRequest = await sendGenRequest(JSON.stringify(prompt))
        interaction.followUp('Generating now...')
        const finalText = await getFinalText(generationRequest, interaction)
    }
}

async function sendGenRequest(messages) {
    const summarization = await fetch(hordeApi + 'generate/text/async', {
        method: 'POST',
        headers: { 'apikey': hordeKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "prompt": `This is a chat conversation. Each message is a key-value pair, where "author" is the user and "content" is the message itself. Please summarize the key points of the conversation, including decisions made, topics discussed, or action items, in a concise paragraph.

            **Message data:** ${messages}
            
            **Summary:** (The summary of the conversation will be placed here)`,
            "params": {
            //     "n": 1,
            //     "frmtadsnsp": false,
                "frmtrmblln": true,
                "frmtrmspch": true,
                "frmttriminc": true,
            //     "max_context_length": 2048,
            //     "max_length": 160,
            //     "rep_pen": 1.1,
            //     "rep_pen_range": 320,
            //     "rep_pen_slope": 10,
            //     "singleline": false,
            //     "temperature": 0.7,
            //     "tfs": 1,
            //     "top_a": 0,
            //     "top_k": 100,
            //     "top_p": 0.92,
            //     "typical": 1,
            //     "sampler_order": [
            //         6,0,1,3,4,2,5
            //     ],
            //     "use_default_badwordsids": true,
            //     "stop_sequence": [
            //       "<|eot_id|>"
            //     ],
            //     "min_p": 0,
            //     "smoothing_factor": 0,
            //     "dynatemp_range": 0,
            //     "dynatemp_exponent": 1
            },
            // //   "softprompt": "string",
            // "trusted_workers": false,
            "slow_workers": false,
            // "worker_blacklist": false,
              "models": [
                // "aphrodite/KoboldAI/LLaMA2-13B-Estopia"
            "aphrodite/NeverSleep/Llama-3-Lumimaid-8B-v0.1-OAS"
            // "koboldcpp/Fimbulvetr-11B-v2.Q4_K_M"
              ],
            // "dry_run": false,
            // "disable_batching": false,
            // "allow_downgrade": false,
        })
    }).then(response => response.json()).then(result => result)
    const generationId = summarization.id
    return generationId
}

async function getFinalText(genId, interaction) {
    const interval = setInterval(async () => {
        const status = await fetch(hordeApi + `generate/text/status/${genId}`).then(response => response.json()).then(result => result)
        if (status.done) {
            console.log(status)
            clearInterval(interval)
            cleanOutput(status.generations[0].text)
            // return status.generations
            return interaction.followUp(status.generations[0].text)
        }
        console.log(`Generating text... ${hordeApi}generate/text/status/${genId}`, status)
    }, 1000)
}


function cleanOutput (text) {
    console.log(text.match(/(---START OF SUMMARY---)\n?(.*)\n?(---END OF SUMMARY---)/gm))
}