import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
const hordeApi = 'https://stablehorde.net/api/'
import { hordeKey } from '#config';

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
        )
        .addStringOption((option) => option
            .setName('model')
            .setDescription('Choose which model to use for generation')
            .setRequired(true)
            .addChoices(
                { name: "Realistic", value: "realistic" },
                { name: "Anime", value: "anime"}
            )
        )
        .addStringOption((option) =>
            option.setName('number').setRequired(false).setDescription('Number of images to generate (4 max)')
        ),

    async execute(interaction: ChatInputCommandInteraction) {

        await interaction.deferReply()
        const prompt = (interaction.options.getString('prompt') as string).toLowerCase()
        const numberOfImages: string | null = interaction.options.getString('number') ? interaction.options.getString('number') : "1"
        const selectedModel = interaction.options.getString('model')
        const parsedBatchSize = parseInt(numberOfImages as string)

        const animeParameters = {
            "prompt": `${prompt} ### ugly, bad anatomy, horrid, watermark, bad art, bad text, illegible, nsfw, naked, nude, nipple, nipples`,
            "params": {
                "cfg_scale": 5,
                "sampler_name": "k_dpm_2_a",
                "height": 1024,
                "width": 1024,
                "steps": 30,
                "karras": true,
                "hires_fix": false,
                "clip_skip": 2,
                "n": parsedBatchSize ? parsedBatchSize : 1,
            },
            "models": [
                "Nova Anime XL"
            ]
            };

        const realisticParameters = {
            "prompt": `${prompt} photo realistic, ultra details ### ugly, bad anatomy, horrid, watermark, bad art, bad text, illegible, anime, cartoon, unrealistic proportions, nsfw, nude, naked, nipples, genitals`,
            "params": {
                "cfg_scale": 5,
                "sampler_name": "k_dpmpp_sde",
                "height": 1024,
                "width": 1024,
                "steps": 35,
                "karras": true,
                "hires_fix": false
            },
            "models": [
                "AlbedoBase XL (SDXL)"
            ]
        }
        

        const body = JSON.stringify( selectedModel === "anime" ? animeParameters : realisticParameters )

        let genId = '';
        const apiData = await fetch(hordeApi + `v2/generate/async`, {
            method: 'POST',
            headers: headers,
            body: body
        })
            .then(response => response.json())
            .then((result: any) => {
                console.log(result)
                genId = result.id
                const kudos = result.kudos
                interaction.followUp(`Generating! Please be patient, time can vary`)
                return result
            })

        let hasMessageBeenRepliedTo = false;    
        const interval = setInterval(async () => {
            if (genId !== '' || genId !== undefined) {
                console.log('checking ID:', hordeApi + `v2/generate/check/${genId}`)
                const check: any = await fetch(hordeApi + `v2/generate/check/${genId}`).then(response => response.json()).then(result => result)

                if (check.faulted) {
                    interaction.followUp('Image could not be generated')
                    return clearInterval(interval)
                }

                if (check.done) {
                    const image: any = await fetch(hordeApi + `v2/generate/status/${genId}`).then(response => response.json()).then(result => result)
                    const attachments = image.generations.map((generation: any) => ({ attachment: generation.img, name: 'generation.png' }))
                    if (!hasMessageBeenRepliedTo) {
                        console.log('Checking done')
                        console.log(check)
                        console.log(image)
                        interaction.followUp({ content: `Generation finished for prompt "${prompt}" <@${interaction.user.id}>! \nCheck it out:`, files: attachments })
                        hasMessageBeenRepliedTo = true;
                    } else {
                        console.log("Interaction has already been replied to.")
                    }
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
