//AI generated, jimp wasnt working with bun and i couldnt be fucked to fix that bs

import type { MessageContextMenuCommandInteraction, TextChannel } from 'discord.js';
const { ContextMenuCommandBuilder, ApplicationCommandType, AttachmentBuilder: AttachmentBuilderClass } = require('discord.js');
const sharp = require('sharp');
const path = require('path');

const canvasSize = {
    width: 800,
    height: 400
}
const avatarSize = {
    width: 400,
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

    async execute (interaction: MessageContextMenuCommandInteraction) {
        await interaction.deferReply()
        const messageText = interaction.targetMessage.content || "";
        const deferred = await interaction.followUp("Creating the quote...");

        try {
            const templateImgPath = path.join(__dirname, "..", "..", "..", "assets", "quote_template.png");
            const avatarImageLink = interaction.targetMessage.author.avatarURL({extension: "png", size: 512});
            const avatarArrayBuffer: ArrayBuffer | null = await getAvatar(avatarImageLink? avatarImageLink : "")
            
            if (avatarArrayBuffer) {
                const avatarBuffer = Buffer.from(avatarArrayBuffer);
                
                // Resize avatar
                const resizedAvatar = await sharp(avatarBuffer)
                    .resize(avatarSize.width, avatarSize.height)
                    .toBuffer();

                // Function to wrap text for SVG
                const wrapText = (text: string, maxChars: number) => {
                    const words = text.split(' ');
                    const lines = [];
                    let currentLine = '';

                    words.forEach(word => {
                        if ((currentLine + word).length > maxChars) {
                            lines.push(currentLine.trim());
                            currentLine = word + ' ';
                        } else {
                            currentLine += word + ' ';
                        }
                    });
                    lines.push(currentLine.trim());
                    return lines;
                };

                const wrappedLines = wrapText(messageText, 25);
                const lineHeight = 36;
                const startY = (canvasSize.height / 2) - ((wrappedLines.length - 1) * lineHeight / 2);

                const textElements = wrappedLines.map((line, i) => 
                    `<text x="${textTransforms.x + 110}" y="${startY + (i * lineHeight)}" text-anchor="middle" fill="white" font-family="sans-serif" font-size="32px" font-weight="bold" dominant-baseline="middle">"${line}"</text>`
                ).join('\n');

                const authorY = startY + (wrappedLines.length * lineHeight) + 10;

                const svgText = `
                <svg width="${canvasSize.width}" height="${canvasSize.height}">
                    ${textElements}
                    <text x="${textTransforms.x + 110}" y="${authorY}" text-anchor="middle" fill="white" font-family="serif" font-size="24px" font-style="italic" dominant-baseline="middle">
                        -${interaction.targetMessage.author.displayName}
                    </text>
                </svg>`;

                const img = await sharp({
                    create: {
                        width: canvasSize.width,
                        height: canvasSize.height,
                        channels: 4,
                        background: { r: 255, g: 255, b: 255, alpha: 1 }
                    }
                })
                .composite([
                    { input: resizedAvatar, left: 0, top: 0 },
                    { input: templateImgPath, left: 0, top: 0 },
                    { input: Buffer.from(svgText), left: 0, top: 0 }
                ])
                .png()
                .toBuffer();

                const imageResponse = new AttachmentBuilderClass(img).setName("hermahs_quote.png");
        
                await deferred.delete();
                await (interaction.channel as TextChannel).send({content: "", files: [imageResponse]});
            }
            
        } catch (error) {
            console.log(error)
            await deferred.edit("There was an error forming the quote :(")
        }
    }
}

async function getAvatar (link: string): Promise<ArrayBuffer | null> {
    try {
        const response = await fetch(link);
        return await response.arrayBuffer();
    } catch (error) {
        console.error(error)
        return null
    }
}
