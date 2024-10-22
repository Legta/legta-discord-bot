const { ContextMenuCommandBuilder, ApplicationCommandType, AttachmentBuilder } = require('discord.js');
const { Jimp, loadFont, HorizontalAlign, VerticalAlign } = require('jimp');
const { SANS_32_WHITE } = require("jimp/fonts")
const path = require('path');
const fs = require('node:fs');

const canvasSize = {
    width: 800,
    height: 400
}
const avatarSize = {
    width: 400,
    height: 400,
}
const backgroundSize = {
    width: 687,
    height: 400,
}
const textTransforms = {
    "x" : 477,
    "y" : 168,
    "Width" : 218,
    "Height" : 93
}

module.exports = {
    data: new ContextMenuCommandBuilder()
    .setName("Make this an image quote")
    .setType(ApplicationCommandType.Message),

    async execute (interaction) {

        try {
            if (interaction.targetMessage.author.bot) return interaction.reply({content: "Can't quote a bot...", ephemeral: true});
            const messageText = interaction.targetMessage.content || "";
            const deferred = await interaction.deferReply({ephemeral: false, fetchReply: true}); //Stores the deferred message
    
            const templateImgPath = path.join(__dirname, "assets", "quote_template.png");
            const backgroundPng = await Jimp.read(templateImgPath);
            const avatarImageLink = interaction.targetMessage.author.avatarURL({extension: "png", size: 512}); //Gets the link with png extension, otherwise it gets webp and Jimp can't work with that
            const avatarImage = await Jimp.read(await getAvatar(avatarImageLink));
            const canvas = new Jimp({ width: canvasSize.width, height: canvasSize.height, color: 0xffffffff }); //Creates the canvas to then composite the images on top of it;
            const font = await loadFont(SANS_32_WHITE);
            const italicFont = await loadFont(path.join(__dirname, "assets", "CrimsonTextItalic.fnt"));
    
            avatarImage.resize({w: avatarSize.width, h: avatarSize.height})
            canvas.composite(avatarImage)
            canvas.composite(backgroundPng)
            let resultCoords = {}; // Creating variable for results of end of text after printing the quote, to get the position of it and use it to offset the name of the user a little bit.
            canvas.print({font, x: textTransforms.x - 65, y: textTransforms.y - textTransforms.y, maxWidth: 350, maxHeight: 370, text: {text: `"${messageText}"`, alignmentX: HorizontalAlign.CENTER, alignmentY: VerticalAlign.MIDDLE}, cb: (results) => resultCoords = results})
            /* Line 52: 412 is textTransforms.x - 65, 65 is the offset I gave it by trial and error on line 50, this makes the username centered accounting for the offsets*/
            canvas.print({font: italicFont, x: textTransforms.x + 65, y: resultCoords.y + 10, text: {text: `-${interaction.targetMessage.author.displayName}`}})

            const img = await canvas.getBuffer("image/png"); //creates a buffer that is readable by the attachment builder
            const imageResponse = new AttachmentBuilder().setFile(img).setName("hermahs_quote.png");
    
            
            await deferred.delete();
            await interaction.channel.send({content: "", files: [imageResponse]});
            
        } catch (error) {
            console.log(error)
        }

    }

}

async function getAvatar (link) {
    try {
        const response = await fetch(link);
        return await response.arrayBuffer();
    } catch (error) {
        return console.log(error)
    }
}