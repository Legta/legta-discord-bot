const {SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder} = require('discord.js');
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

        if (checkIfJSONExists(interaction)) { //checks if the file exists before anything else
            const JSONdata = readJSON(interaction);

            for (let i = 0; i < JSONdata.length; i++) {
                replyEmbed.addFields(
                    { name: `Message: "${JSONdata[i].message}"`, value: `Reaction: "${JSONdata[i].response}"\nType: ${JSONdata[i].type==='text-reply' ? 'Text':'Emoji'}`}
                )
            }

            const row = new ActionRowBuilder();
            const selectionMenu = new StringSelectMenuBuilder() //initializes the select menu
            .setCustomId('reactions')
            .setPlaceholder('Select a reaction to see more options');

            for (let i = 0; i < JSONdata.length; i++) { //adds an option to the menu for each json item
                selectionMenu.addOptions(
                    new StringSelectMenuOptionBuilder()
                    .setLabel(JSONdata[i].message)
                    .setDescription(JSONdata[i].response)
                    .setValue(`${i}`)
                )
            }

            row.addComponents(selectionMenu);
            const response = await interaction.reply({embeds: [replyEmbed], components: [row]}); //replies to the command with the embed and action row which contains the string selector

            const filter = (i) => i.user.id === interaction.user.id;

            try { //every single interaction has to be awaited here including the response variable above because who the fuck knows. NEXT DAY UPDATE: Followed this video https://www.youtube.com/watch?v=fZ6thE4YMes and apparently it works if just the cololector is awaited
                const collector = await response.createMessageComponentCollector({filter, componentType: ComponentType.StringSelect, time:60_000})
                collector.on('collect', async i => {
                    const editButton = new ButtonBuilder()
                    .setCustomId('edit')
                    .setLabel(`Edit "${JSONdata[i.values].message}"`)
                    .setStyle(ButtonStyle.Primary);
                    
                    const removeButton = new ButtonBuilder()
                    .setCustomId('delete')
                    .setLabel(`Remove "${JSONdata[i.values].message}"`)
                    .setStyle(ButtonStyle.Danger);
                    
                    const rowButtons = new ActionRowBuilder().addComponents(editButton, removeButton);

                    await i.update({embeds:[replyEmbed], components: [rowButtons]});
                })
                    const collectorButtons = await response.createMessageComponentCollector({filter, componentType: ComponentType.Button, time:60_000})

                    collectorButtons.on('collect', async interactionFromButton => {
                        console.log(interactionFromButton)
                        if (interactionFromButton.customId==='edit') {
                            await interactionFromButton.reply('Edit button')
                        }
                        if (interactionFromButton.customId==='delete') {
                            await interactionFromButton.reply('Delete button')
                        }
                    })

            } catch (error) {
                console.log(error)
                await i.editReply('a la verga')
            }
        } else if (!checkIfJSONExists(interaction)) {
            interaction.reply('There are no reactions in the server.')
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