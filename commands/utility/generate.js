const { SlashCommandBuilder } = require('discord.js')
const hordeApi = 'https://stablehorde.net/api/'
const {hordeKey} = require('../../config.json')

const headers = {
    'apikey': hordeKey,
    'Content-Type': 'application/json'
};


module.exports = {
    data: new SlashCommandBuilder()
        .setName('generate')
        .setDescription('Generate an AI image')
        .addStringOption((option) =>
            option.setName('prompt').setRequired(true).setDescription('Prompt to generate!')
        ),

    async execute(interaction) {
        await interaction.deferReply()
        const prompt = interaction.options.getString('prompt').toLowerCase()
        const randomSeed = generateSeed()
        const body = JSON.stringify({
            "prompt": prompt,
            "params": {
                "cfg_scale": 7,
                "seed": randomSeed,
                "sampler_name": "k_dpmpp_2m",
                "height": 512,
                "width": 512,
                "steps": 30,
                "tiling": false,
                "karras": true,
                "clip_skip": 2,
                "n": 1
            },
            "nsfw": true,
            "censor_nsfw": false,
            "trusted_workers": true,
            "model": "Pony Diffusion XL",
            "r2": true,
            "replacement_filter": true,
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
                genId = result.id
                kudos = result.kudos
                interaction.followUp(`Generating! Please be patient`)
                return result
            })

        const interval = setInterval(async () => {
            if (genId !== '') {
                console.log('checking ID:', hordeApi + `/v2/generate/check/${genId}`)
                const check = await fetch(hordeApi + `/v2/generate/check/${genId}`).then(response => response.json()).then(result => result)

                if (check.faulted) {
                    interaction.followUp('Image could not be generated')
                    return clearInterval(interval)
                }

                if (check.done) {
                    const image = await fetch(hordeApi + `/v2/generate/status/${genId}`).then(response => response.json()).then(result => result)
                    const imgUrl = image.generations[0].img
                    interaction.followUp({content: `Generation finished for prompt "${prompt}" <@${interaction.user.id}>! \nCheck it out:`, files: [{attachment:imgUrl, name:'generation.png'}] })
                    console.log(image)
                    
                    console.log('Checking done')
                    return clearInterval(interval)
                }
                console.log(`generating... \nWait time: ${check.wait_time}\nQueue position: ${check.queue_position}`)
                console.log(check)
            }
        }, 2000)
    }
}

function generateSeed() {
    const number = Math.floor(Math.random() * (Math.random() * 10000))
    console.log(number)
    return number.toString()
}