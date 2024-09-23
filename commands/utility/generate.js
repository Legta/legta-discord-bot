const { SlashCommandBuilder } = require('discord.js')
const hordeApi = 'https://stablehorde.net/api/'
const { hordeKey } = require('../../config.json')

const headers = {
    'apikey': hordeKey,
    'Content-Type': 'application/json'
};

let currentModels = []

fetch(hordeApi + '/v2/status/models?model_state=known').then(response => response.json()).then(result => result.map(model => currentModels.push(model.name)))

module.exports = {
    data: new SlashCommandBuilder()
        .setName('generate')
        .setDescription('Generate an AI image')
        .addStringOption((option) =>
            option.setName('prompt').setRequired(true).setDescription('Prompt to generate!')
        )
        .addStringOption((option) => option
            .setName('model')
            .setDescription('Choose which model to use for generation (Flux fp8 recommended)')
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addStringOption((option) =>
            option.setName('number').setRequired(false).setDescription('Number of images to generate (4 max)')
        )
    ,

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        if (focusedValue === '') return await interaction.respond(
            currentModels.slice().splice(0, 24).map(choice => ({name: choice, value: choice}))
        )
        if (currentModels.length > 0) {
            const choices = currentModels
            // console.log('focused', focusedValue)
            const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedValue));
            await interaction.respond(
                filtered.map(choice => ({ name: choice, value: choice })),
            );
        }
    },

    async execute(interaction) {
        await interaction.deferReply()
        const prompt = interaction.options.getString('prompt').toLowerCase()
        const numberOfImages = interaction.options.getString('number') ? interaction.options.getString('number') : 1
        const selectedModel = interaction.options.getString('model')
        const parsedBatchSize = parseInt(numberOfImages)
        console.log('Selected model:', selectedModel)
//        const randomSeed = generateSeed()
        const body = JSON.stringify({
            "prompt": selectedModel === 'Pony Diffusion XL'? 'score_9, score_8_up, score_7_up, score_6_up, score_5_up, score_4_up, ' + prompt : prompt,
            "params": {
                "cfg_scale": selectedModel === 'Flux.1-Schnell fp8 (Compact)' ? 3.5 : 7,
                //"seed": randomSeed,
                "sampler_name": "k_euler",
                "seed_variation": 1,
                "height": 512,
                "width": 512,
                "steps": 20,
                "tiling": false,
		        "hires_fix": true,
                "clip_skip": selectedModel === 'Pony Diffusion XL' ? 2 : 1,
                "n": parsedBatchSize > 0 ? parsedBatchSize < 5 ? parsedBatchSize : 4 : 1
            },
            "nsfw": true,
            "censor_nsfw": false,
            "trusted_workers": true,
            "models": [selectedModel],
            // "r2": true,
            // "replacement_filter": true,
            "shared": false,
            "slow_workers": false,
            "dry_run": false
        })
        let genId = ''
        const apiData = await fetch(hordeApi + `v2/generate/async`, {
            method: 'POST',
            headers: headers,
            body: body
        })
            .then(response => response.json())
            .then(result => {
                console.log(result)
                genId = result.id
                kudos = result.kudos
                interaction.followUp(`Generating! Please be patient`)
                return result
            })

        const interval = setInterval(async () => {
            if (genId !== '' || genId !== undefined) {
                console.log('checking ID:', hordeApi + `/v2/generate/check/${genId}`)
                const check = await fetch(hordeApi + `/v2/generate/check/${genId}`).then(response => response.json()).then(result => result)

                if (check.faulted) {
                    interaction.followUp('Image could not be generated')
                    return clearInterval(interval)
                }

                if (check.done) {
                    const image = await fetch(hordeApi + `/v2/generate/status/${genId}`).then(response => response.json()).then(result => result)
                    const attachments = image.generations.map(generation => ({ attachment: generation.img, name: 'generation.png' }))
                    interaction.followUp({ content: `Generation finished for prompt "${prompt}" <@${interaction.user.id}>! \nCheck it out:`, files: attachments })
                    console.log('Checking done')
                    console.log(check)
                    console.log(image)
                    return clearInterval(interval)
                }
                console.log(`generating... \nWait time: ${check.wait_time}\nQueue position: ${check.queue_position}`)
            }
        }, 2000)
    }
}

function generateSeed() {
    const number = Math.floor(Math.random() * (Math.random() * 10000))
    console.log(number)
    return number.toString()
}
