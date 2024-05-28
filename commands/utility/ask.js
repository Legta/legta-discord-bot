const { SlashCommandBuilder } = require('discord.js')
const hordeApi = 'https://stablehorde.net/api/v2/'
const { hordeKey } = require('../../config.json')
// const fs = require('fs')
// const path = require('path')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ask')
        .setDescription('Ask something to an AI')
        .addStringOption((option) => option.setName('prompt').setRequired(true).setDescription('What do you want to ask?')),

    async execute(interaction) {
        interaction.deferReply()
        const question = interaction.options.getString('prompt')
        const generationRequest = await sendGenRequest(question)
        interaction.followUp('Generating now...')
        const finalText = await getFinalText(generationRequest, interaction)
    }
}

async function sendGenRequest(prompt) {
    const summarization = await fetch(hordeApi + 'generate/text/async', {
        method: 'POST',
        headers: { 'apikey': hordeKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "prompt": `The user has asked the following question: ${prompt}

            Respond with:
            
            A concise and informative answer to the user's question, based solely on the provided question and your general knowledge.
            
            'Uwufy' your response, for example: 

            User's question: "When was Tekken 7 released?"

            Your response: "Tekken 7 was weweased t-to awcades in Mawch 2015. It is the x3 seventh ÚwÚ main and nyinth uvwaww instawwment *sees bulge* in the x3 Tekken s-s-sewies, and is the x3 fiwst in that sewies t-to be weweased fow PC."
            `,
            "params": {
            //     "n": 1,
            //     "frmtadsnsp": false,
                "frmtrmblln": true,
                "frmtrmspch": true,
                "frmttriminc": true,
                "max_context_length": 2048,
                "max_length": 200,
                "rep_pen": 1.15,
                "rep_pen_range": 320,
                "rep_pen_slope": 10,
            //     "singleline": false,
                "temperature": 0.7,
                "tfs": 1,
                "top_a": 0,
                "top_k": 100,
                "top_p": 0.92,
                "typical": 1,
            //     "sampler_order": [
            //         6,0,1,3,4,2,5
            //     ],
            //     "use_default_badwordsids": true,
                "stop_sequence": [
                  "<|eot_id|>"
                ],
                "min_p": 0,
            },
            // "trusted_workers": false,
            "slow_workers": false,
              "models": [
                // "aphrodite/KoboldAI/LLaMA2-13B-Estopia"
            // "aphrodite/NeverSleep/Llama-3-Lumimaid-8B-v0.1-OAS"
            // "koboldcpp/Fimbulvetr-11B-v2.Q4_K_M"
            "koboldcpp/Llama-3-Lumimaid-70B"
              ],
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