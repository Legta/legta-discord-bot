//Creates an emoji based on an URL and name provided by the user. Docs: https://old.discordjs.dev/#/docs/discord.js/14.14.1/class/GuildEmojiManager?scrollTo=create
const { SlashCommandBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
    .setName('addemoji')
    .setDescription('Create an emoji with the provided link')
    .addStringOption(option =>
		option.setName('url')
		.setDescription('The image URL for the custom emoji')
		.setRequired(true))
    .addStringOption((option) => 
        option.setName('name')
        .setDescription("The custom emoji's name")
        .setRequired(true)
    ),
    async execute (interaction) {
        const imgUrl = interaction.options.getString('url');
        let emojiName = interaction.options.getString('name').replaceAll(' ', '_');
        const https = require('https');
        
         https.get(imgUrl, async (response) => {
            const headers = response.headers;
            const length = parseInt(headers['content-length'], 10);
            const type = headers['content-type'];
            // console.log(headers, type, length * 1024);

            if (emojiName.length < 2) {
                emojiName += '_';
            }

            if (/* length <= 256 * 1024 &&  /*  Checking if the image size is under or equal to 256kb   */type.toLowerCase() === 'image/jpeg' || type.toLowerCase() === 'image/png' || type.toLowerCase() === 'image/gif' || type.toLowerCase() === 'image/webp') {
                console.log('Image size is good. (Under 256kb)');
                await interaction.guild.emojis.create({
                    attachment: `${imgUrl}`, 
                    name: `${emojiName}`
                    })
                .then(console.log(`Created new emoji with name ${emojiName} and url ${imgUrl}`), interaction.reply(`Emoji "${emojiName}" created succesfully :)`))
                .catch(console.error);
            } else {
                console.error('An error ocurred');
                console.log(type);
                interaction.reply('An error ocurred while creating the emoji');
            }
        })
        .on('error', (error) => {console.error('Error fetching image headers:'), error});

        
    }
}

