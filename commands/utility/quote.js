const { ContextMenuCommandBuilder, ApplicationCommandType, AttachmentBuilder } = require('discord.js');
const { Jimp } = require('jimp');
const path = require('path');
const fs = require('node:fs');

const imageSize = "800x400"
const avatarSize = "400x400"
const backgroundSize = "687x400"
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

        const deferred = await interaction.deferReply({ephemeral: false, fetchReply: true}); //Stores the deferred message
        const messageText = interaction.targetMessage.content || "";
        const templateImgPath = path.join(__dirname, "assets", "quote_template.png");
        const baseImage = await Jimp.read(templateImgPath);

        const imageResponse = new AttachmentBuilder().setFile(templateImgPath).setName("hermahs_quote.png")

        setTimeout(async () => {
            await deferred.delete();
            await interaction.channel.send({content: messageText, files: [imageResponse]});
        }, 2500);
    }

}