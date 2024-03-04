const {SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputStyle, TextInputBuilder, Events} = require('discord.js');
const fs = require('fs');
const path = require('path');

// This command /showreactions will list the current replies added by /addreaction which are present in the guild's responses.json file
// https://discordjs.guide/popular-topics/embeds.html#embed-preview

module.exports = {
    data: new SlashCommandBuilder()
    .setName('showreactions')
    .setDescription('Show the current interactions for this server'),

    async execute (interaction) {
        const replyEmbed = new EmbedBuilder() //initializes the embed
        .setColor('#6EFFE8')
        .setTitle(`Current interactions for ${interaction.guild.name}`)
        .setDescription('Interactions added with the /addreaction command:')
        .setAuthor({name: interaction.user.globalName, iconURL: interaction.user.avatarURL()})
        .setFooter({text: 'Anita Max Wynn', iconURL: interaction.client.user.avatarURL()});

        if (checkIfJSONExists(interaction)) { //checks if the file exists before anything else
            const JSONdata = readJSON(interaction);

            for (let i = 0; i < JSONdata.length; i++) { //adds a field to the embed for each entry present in the JSON file
                replyEmbed.addFields(
                    { name: `Message: "${JSONdata[i].message}"`, value: `Reaction: "${JSONdata[i].response}"\nType: ${JSONdata[i].type==='text-reply' ? 'Text':'Emoji'}`} 
                )
            }

            const row = new ActionRowBuilder(); //initializes the action row
            const selectionMenu = new StringSelectMenuBuilder() //initializes the select menu
            .setCustomId('reactions')
            .setPlaceholder('Select a reaction to edit or remove');

            for (let i = 0; i < JSONdata.length; i++) { //adds an option to the menu for each json item
                selectionMenu.addOptions(
                    new StringSelectMenuOptionBuilder()
                    .setLabel(JSONdata[i].message)
                    .setDescription(JSONdata[i].response)
                    .setValue(`${i}`)
                )
            }

            row.addComponents(selectionMenu); //adds the string selection menu to the row
            const response = await interaction.reply({embeds: [replyEmbed], components: [row]}); //replies to the command with the embed and action row which contains the string selector

            const filter = (i) => i.user.id === interaction.user.id;

            try { //every single interaction has to be awaited here including the response variable above because who the fuck knows, theyre all promise based. NEXT DAY UPDATE: Followed this video https://www.youtube.com/watch?v=fZ6thE4YMes and apparently it works if just the cololector is awaited
                const collector = await response.createMessageComponentCollector({filter, componentType: ComponentType.StringSelect, time:60_000})
                collector.on('collect', async i => { //when the user selects an option, updates the message to include buttons

                    const currentReaction = { //storing the retrieved values in an object for easier access
                        message: JSONdata[i.values].message,
                        response: JSONdata[i.values].response,
                        type: JSONdata[i.values].type,                        
                    }

                    const editButton = new ButtonBuilder() //creating the buttons
                    .setCustomId('edit')
                    .setLabel(`Edit "${currentReaction.message}"`)
                    .setStyle(ButtonStyle.Primary);
                    
                    const removeButton = new ButtonBuilder()
                    .setCustomId('delete')
                    .setLabel(`Remove "${currentReaction.message}"`)
                    .setStyle(ButtonStyle.Danger);
                    
                    const rowButtons = new ActionRowBuilder().addComponents(editButton, removeButton); //adding the buttons to a new action row to display later

                    await i.update({components: [rowButtons]});

                    const collectorButtons = await response.createMessageComponentCollector({filter, componentType: ComponentType.Button, time:60_000})

                    collectorButtons.on('collect', async interactionFromButton => { //when a button is pressed, executes logic for the selected button
                        if (interactionFromButton.customId==='edit') { 
                            const modal = new ModalBuilder()    //creating the modal
                            .setCustomId('edit-modal')
                            .setTitle(`Editing reaction for "${currentReaction.message}"...`)
                            
                            const messageInput = new TextInputBuilder() //creating the text inputs for the new text
                            .setCustomId('new-message')
                            .setLabel('What message will the bot respond to?')
                            .setStyle(TextInputStyle.Short);

                            const typeInput = new TextInputBuilder()
                            .setCustomId('new-reaction-type')
                            .setLabel('Type? ("emoji" or "text")')
                            .setStyle(TextInputStyle.Short);

                            const reactionInput = new TextInputBuilder()
                            .setCustomId('new-reaction')
                            .setLabel('What will the bot respond/react with?')
                            .setStyle(TextInputStyle.Short);

                            const firstRow = new ActionRowBuilder().addComponents(messageInput) //action rows can only have one text input so we create an action row for each text input
                            const secondRow = new ActionRowBuilder().addComponents(typeInput)
                            const thirdRow = new ActionRowBuilder().addComponents(reactionInput)

                            modal.addComponents(firstRow, secondRow, thirdRow) //adding the action rows to the modal

                            await interactionFromButton.showModal(modal)

                            interaction.client.on(Events.InteractionCreate, async modalInteraction => { //new event listener to listen for when the modal is submitted
                                if (!modalInteraction.isModalSubmit()) return;

                                const index = i.values; //value of selected interaction which is also the index of the JSONdata parsed array
                                

                                if (modalInteraction.customId === 'edit-modal') {

                                    const newReaction = {
                                        message: modalInteraction.fields.getTextInputValue('new-message'),
                                        response: modalInteraction.fields.getTextInputValue('new-reaction'),
                                        type: modalInteraction.fields.getTextInputValue('new-reaction-type'),
                                    }

                                    switch (modalInteraction.fields.getTextInputValue('new-reaction-type').toLowerCase()) {
                                        case 'text':
                                            replaceElementJSON(modalInteraction, newReaction, index)
                                            await modalInteraction.reply(`✅ Successfully edited reaction!\nNew reaction:\nNew message: "${newReaction.message}"\nNew reaction: "${newReaction.response}"\nType: "Text"`)
                                            break;
                                        case 'emoji':
                                            const unicodeEmojiRegex = /(?:\ud83d\udc68\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc68\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffc]|\ud83d\udc68\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffd]|\ud83d\udc68\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffe]|\ud83d\udc69\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffc-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffd-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffb|\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffc\udffe\udfff]|\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb\udffc]|\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffd\udfff]|\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb-\udffd]|\ud83d\udc69\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffe]|\ud83d\udc69\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb-\udffe]|\ud83e\uddd1\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffb|\ud83e\uddd1\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb\udffc]|\ud83e\uddd1\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udffd]|\ud83e\uddd1\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udffe]|\ud83e\uddd1\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udfff]|\ud83e\uddd1\u200d\ud83e\udd1d\u200d\ud83e\uddd1|\ud83d\udc6b\ud83c[\udffb-\udfff]|\ud83d\udc6c\ud83c[\udffb-\udfff]|\ud83d\udc6d\ud83c[\udffb-\udfff]|\ud83d[\udc6b-\udc6d])|(?:\ud83d[\udc68\udc69])(?:\ud83c[\udffb-\udfff])?\u200d(?:\u2695\ufe0f|\u2696\ufe0f|\u2708\ufe0f|\ud83c[\udf3e\udf73\udf93\udfa4\udfa8\udfeb\udfed]|\ud83d[\udcbb\udcbc\udd27\udd2c\ude80\ude92]|\ud83e[\uddaf-\uddb3\uddbc\uddbd])|(?:\ud83c[\udfcb\udfcc]|\ud83d[\udd74\udd75]|\u26f9)((?:\ud83c[\udffb-\udfff]|\ufe0f)\u200d[\u2640\u2642]\ufe0f)|(?:\ud83c[\udfc3\udfc4\udfca]|\ud83d[\udc6e\udc71\udc73\udc77\udc81\udc82\udc86\udc87\ude45-\ude47\ude4b\ude4d\ude4e\udea3\udeb4-\udeb6]|\ud83e[\udd26\udd35\udd37-\udd39\udd3d\udd3e\uddb8\uddb9\uddcd-\uddcf\uddd6-\udddd])(?:\ud83c[\udffb-\udfff])?\u200d[\u2640\u2642]\ufe0f|(?:\ud83d\udc68\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d[\udc68\udc69]|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\u2764\ufe0f\u200d\ud83d\udc68|\ud83d\udc68\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d[\udc68\udc69]|\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d[\udc66\udc67]|\ud83c\udff3\ufe0f\u200d\ud83c\udf08|\ud83c\udff4\u200d\u2620\ufe0f|\ud83d\udc15\u200d\ud83e\uddba|\ud83d\udc41\u200d\ud83d\udde8|\ud83d\udc68\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\ud83d[\udc66\udc67]|\ud83d\udc6f\u200d\u2640\ufe0f|\ud83d\udc6f\u200d\u2642\ufe0f|\ud83e\udd3c\u200d\u2640\ufe0f|\ud83e\udd3c\u200d\u2642\ufe0f|\ud83e\uddde\u200d\u2640\ufe0f|\ud83e\uddde\u200d\u2642\ufe0f|\ud83e\udddf\u200d\u2640\ufe0f|\ud83e\udddf\u200d\u2642\ufe0f)|[#*0-9]\ufe0f?\u20e3|(?:[©®\u2122\u265f]\ufe0f)|(?:\ud83c[\udc04\udd70\udd71\udd7e\udd7f\ude02\ude1a\ude2f\ude37\udf21\udf24-\udf2c\udf36\udf7d\udf96\udf97\udf99-\udf9b\udf9e\udf9f\udfcd\udfce\udfd4-\udfdf\udff3\udff5\udff7]|\ud83d[\udc3f\udc41\udcfd\udd49\udd4a\udd6f\udd70\udd73\udd76-\udd79\udd87\udd8a-\udd8d\udda5\udda8\uddb1\uddb2\uddbc\uddc2-\uddc4\uddd1-\uddd3\udddc-\uddde\udde1\udde3\udde8\uddef\uddf3\uddfa\udecb\udecd-\udecf\udee0-\udee5\udee9\udef0\udef3]|[\u203c\u2049\u2139\u2194-\u2199\u21a9\u21aa\u231a\u231b\u2328\u23cf\u23ed-\u23ef\u23f1\u23f2\u23f8-\u23fa\u24c2\u25aa\u25ab\u25b6\u25c0\u25fb-\u25fe\u2600-\u2604\u260e\u2611\u2614\u2615\u2618\u2620\u2622\u2623\u2626\u262a\u262e\u262f\u2638-\u263a\u2640\u2642\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267b\u267f\u2692-\u2697\u2699\u269b\u269c\u26a0\u26a1\u26aa\u26ab\u26b0\u26b1\u26bd\u26be\u26c4\u26c5\u26c8\u26cf\u26d1\u26d3\u26d4\u26e9\u26ea\u26f0-\u26f5\u26f8\u26fa\u26fd\u2702\u2708\u2709\u270f\u2712\u2714\u2716\u271d\u2721\u2733\u2734\u2744\u2747\u2757\u2763\u2764\u27a1\u2934\u2935\u2b05-\u2b07\u2b1b\u2b1c\u2b50\u2b55\u3030\u303d\u3297\u3299])(?:\ufe0f|(?!\ufe0e))|(?:(?:\ud83c[\udfcb\udfcc]|\ud83d[\udd74\udd75\udd90]|[\u261d\u26f7\u26f9\u270c\u270d])(?:\ufe0f|(?!\ufe0e))|(?:\ud83c[\udf85\udfc2-\udfc4\udfc7\udfca]|\ud83d[\udc42\udc43\udc46-\udc50\udc66-\udc69\udc6e\udc70-\udc78\udc7c\udc81-\udc83\udc85-\udc87\udcaa\udd7a\udd95\udd96\ude45-\ude47\ude4b-\ude4f\udea3\udeb4-\udeb6\udec0\udecc]|\ud83e[\udd0f\udd18-\udd1c\udd1e\udd1f\udd26\udd30-\udd39\udd3d\udd3e\uddb5\uddb6\uddb8\uddb9\uddbb\uddcd-\uddcf\uddd1-\udddd]|[\u270a\u270b]))(?:\ud83c[\udffb-\udfff])?|(?:\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc65\udb40\udc6e\udb40\udc67\udb40\udc7f|\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc73\udb40\udc63\udb40\udc74\udb40\udc7f|\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc77\udb40\udc6c\udb40\udc73\udb40\udc7f|\ud83c\udde6\ud83c[\udde8-\uddec\uddee\uddf1\uddf2\uddf4\uddf6-\uddfa\uddfc\uddfd\uddff]|\ud83c\udde7\ud83c[\udde6\udde7\udde9-\uddef\uddf1-\uddf4\uddf6-\uddf9\uddfb\uddfc\uddfe\uddff]|\ud83c\udde8\ud83c[\udde6\udde8\udde9\uddeb-\uddee\uddf0-\uddf5\uddf7\uddfa-\uddff]|\ud83c\udde9\ud83c[\uddea\uddec\uddef\uddf0\uddf2\uddf4\uddff]|\ud83c\uddea\ud83c[\udde6\udde8\uddea\uddec\udded\uddf7-\uddfa]|\ud83c\uddeb\ud83c[\uddee-\uddf0\uddf2\uddf4\uddf7]|\ud83c\uddec\ud83c[\udde6\udde7\udde9-\uddee\uddf1-\uddf3\uddf5-\uddfa\uddfc\uddfe]|\ud83c\udded\ud83c[\uddf0\uddf2\uddf3\uddf7\uddf9\uddfa]|\ud83c\uddee\ud83c[\udde8-\uddea\uddf1-\uddf4\uddf6-\uddf9]|\ud83c\uddef\ud83c[\uddea\uddf2\uddf4\uddf5]|\ud83c\uddf0\ud83c[\uddea\uddec-\uddee\uddf2\uddf3\uddf5\uddf7\uddfc\uddfe\uddff]|\ud83c\uddf1\ud83c[\udde6-\udde8\uddee\uddf0\uddf7-\uddfb\uddfe]|\ud83c\uddf2\ud83c[\udde6\udde8-\udded\uddf0-\uddff]|\ud83c\uddf3\ud83c[\udde6\udde8\uddea-\uddec\uddee\uddf1\uddf4\uddf5\uddf7\uddfa\uddff]|\ud83c\uddf4\ud83c\uddf2|\ud83c\uddf5\ud83c[\udde6\uddea-\udded\uddf0-\uddf3\uddf7-\uddf9\uddfc\uddfe]|\ud83c\uddf6\ud83c\udde6|\ud83c\uddf7\ud83c[\uddea\uddf4\uddf8\uddfa\uddfc]|\ud83c\uddf8\ud83c[\udde6-\uddea\uddec-\uddf4\uddf7-\uddf9\uddfb\uddfd-\uddff]|\ud83c\uddf9\ud83c[\udde6\udde8\udde9\uddeb-\udded\uddef-\uddf4\uddf7\uddf9\uddfb\uddfc\uddff]|\ud83c\uddfa\ud83c[\udde6\uddec\uddf2\uddf3\uddf8\uddfe\uddff]|\ud83c\uddfb\ud83c[\udde6\udde8\uddea\uddec\uddee\uddf3\uddfa]|\ud83c\uddfc\ud83c[\uddeb\uddf8]|\ud83c\uddfd\ud83c\uddf0|\ud83c\uddfe\ud83c[\uddea\uddf9]|\ud83c\uddff\ud83c[\udde6\uddf2\uddfc]|\ud83c[\udccf\udd8e\udd91-\udd9a\udde6-\uddff\ude01\ude32-\ude36\ude38-\ude3a\ude50\ude51\udf00-\udf20\udf2d-\udf35\udf37-\udf7c\udf7e-\udf84\udf86-\udf93\udfa0-\udfc1\udfc5\udfc6\udfc8\udfc9\udfcf-\udfd3\udfe0-\udff0\udff4\udff8-\udfff]|\ud83d[\udc00-\udc3e\udc40\udc44\udc45\udc51-\udc65\udc6a-\udc6d\udc6f\udc79-\udc7b\udc7d-\udc80\udc84\udc88-\udca9\udcab-\udcfc\udcff-\udd3d\udd4b-\udd4e\udd50-\udd67\udda4\uddfb-\ude44\ude48-\ude4a\ude80-\udea2\udea4-\udeb3\udeb7-\udebf\udec1-\udec5\uded0-\uded2\uded5\udeeb\udeec\udef4-\udefa\udfe0-\udfeb]|\ud83e[\udd0d\udd0e\udd10-\udd17\udd1d\udd20-\udd25\udd27-\udd2f\udd3a\udd3c\udd3f-\udd45\udd47-\udd71\udd73-\udd76\udd7a-\udda2\udda5-\uddaa\uddae-\uddb4\uddb7\uddba\uddbc-\uddca\uddd0\uddde-\uddff\ude70-\ude73\ude78-\ude7a\ude80-\ude82\ude90-\ude95]|[\u23e9-\u23ec\u23f0\u23f3\u267e\u26ce\u2705\u2728\u274c\u274e\u2753-\u2755\u2795-\u2797\u27b0\u27bf\ue50a])|\ufe0f/g
                                            if (modalInteraction.fields.getTextInputValue('new-reaction').match(unicodeEmojiRegex)) {
                                                replaceElementJSON(modalInteraction, newReaction, index)
                                                await modalInteraction.reply(`✅ Successfully edited reaction!\nNew reaction:\nNew message: "${newReaction.message}"\nNew reaction: "${newReaction.response}"\nType: "Emoji"`)
                                                return
                                            }
                                            await modalInteraction.reply(`🚨 "${modalInteraction.fields.getTextInputValue('new-reaction')}" is not a valid emoji.`)
                                            break;
                                        default:
                                            return modalInteraction.reply('You entered an invalid type! It should be either "emoji" or "text"')

                                    }
                                }
                            })
                        }
                        if (interactionFromButton.customId==='delete') { //if delete button is pressed, call deleteFromJSON function and update the message
                            try {
                                await deleteFromJSON(interactionFromButton, i.values)
                                await interactionFromButton.update({
                                    content: `✅ Successfully deleted "${currentReaction.message}" from reactions!`,
                                    components: [],
                                    embeds: []
                                })
                            } catch (error) {
                                await interactionFromButton.update({
                                    content: `❌ There was an error removing "${currentReaction.message}" from reactions.`,
                                    components: [],
                                    embeds: []
                                })
                                console.error(error);
                            }
                        }
                    })

                    collectorButtons.on('end', () => { //when the button timer ends, disable the buttons
                        editButton.setDisabled(true)
                        removeButton.setDisabled(true)
                        i.editReply({components: [rowButtons]})
                    })
                })
                    

            } catch (error) {
                console.log(error)
                await interaction.editReply('a la verga')
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

function deleteFromJSON (interInfo, index) { //Removes an element from the array in the JSON with the specified index
    const filePath = path.join(__dirname, '..', '..', 'guild-data', interInfo.guild.id, 'responses.json'); //Sets the folder path, using the guild ID as the name of the folder where the file will be saved
    try {
        const jsonData = JSON.parse(fs.readFileSync(filePath)); //parses the array previously created
        if (Array.isArray(jsonData)) { //if the data in the file is an array, it pushes the data to it
            jsonData.splice(index, 1); //using .splice(), remove the element at index 1 spanning 1 element.
            fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2)); //write the new array to the file overwriting whatever it had before
        }
        else {
            console.log('WARNING: JSON file data is not array. Could not push new data.');
        }
        
    } catch (error) {
        console.error(error);
    }
}

function replaceElementJSON (interInfo, data, index) {
    const folderPath = path.join(__dirname, '..', '..', 'guild-data', interInfo.guild.id); //Sets the folder path, using the guild ID as the name of the folder where the file will be saved
    const pathWithJSON = path.join(folderPath, 'responses.json'); //just the full folder path with the name of the file added
    try {
        const jsonData = JSON.parse(fs.readFileSync(pathWithJSON)); //parses the array previously created
        if (Array.isArray(jsonData)) { //if the data in the file is an array, it pushes the data to it
            jsonData[index] = data; //at this point, we just updated the array we imported from the file but have not written the new data to the file yet.
            fs.writeFileSync(pathWithJSON, JSON.stringify(jsonData, null, 2));
        }
        else {
            console.log('WARNING: JSON file data is not array. Could not push new data.');
        }
        
    } catch (error) {
        console.error(error);
    }
}
