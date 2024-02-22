const {SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder} = require('discord.js');
const fs = require('fs');
const path = require('path');

// This command /showreactions will list the current replies added by /addreaction which are present in the guild's responses.json file
// https://discordjs.guide/popular-topics/embeds.html#embed-preview

module.exports = {
    data: new SlashCommandBuilder()
    .setName('showreactions')
    .setDescription('Show the current interactions for this server'),

    async execute (interaction) {
        const replyEmbed = new EmbedBuilder()
        .setColor('#6EFFE8')
        .setTitle(`Current interactions for ${interaction.guild.name}`)
        .setDescription('Interactions added with the /addreaction command:')
        .setAuthor({name: interaction.user.globalName, iconURL: interaction.user.avatarURL()})
        .setFooter({text: 'Anita Max Wynn', iconURL: interaction.client.user.avatarURL()});

        if (checkIfJSONExists(interaction)) {
            const JSONdata = readJSON(interaction);
            for (let i=0;i<JSONdata.length;i++) {
                replyEmbed.addFields(
                    { name: `Message: "${JSONdata[i].message}"`, value: `Reaction: "${JSONdata[i].response}"`}
                )
                // interaction.reply({embeds: [replyEmbed]});
            }
            const editButton = new ButtonBuilder()
            .setCustomId('edit')
            .setLabel('Edit')
            .setStyle(ButtonStyle.Primary);
    
            const removeButton = new ButtonBuilder()
            .setCustomId('delete')
            .setLabel('Remove reaction')
            .setStyle(ButtonStyle.Danger);
    
            const row = new ActionRowBuilder()
            .addComponents(editButton, removeButton);
    
    
            interaction.reply({embeds: [replyEmbed], components: [row]});
        }
        

    }
}


function readJSON (interInfo) {
    const folderPath = path.join(__dirname, '..', '..', 'guild-data', interInfo.guild.id);
    const pathWithJSON = path.join(folderPath, 'responses.json');
    const jsonData = JSON.parse(fs.readFileSync(pathWithJSON));
    return jsonData;
}

function checkIfJSONExists (interInfo) { //Will check if the file exists and create the directory if that doesn't exist either
    const JSONpath = path.join(__dirname, '..', '..', 'guild-data', interInfo.guild.id);
    const JSONfilename = `responses.json`;
    // console.log(`JSONpath: ${JSONpath}`);
    if (fs.existsSync(JSONpath)) {
        return fs.existsSync(path.join(JSONpath, JSONfilename));
    }
    else {
        fs.mkdirSync(JSONpath, {recursive:true});
        console.log('Guild data directory created');
        return false;
    }
}