import { AttachmentBuilder, Client, TextChannel } from "discord.js";

import type { MessageCreateOptions } from "discord.js";

//This function makes an API request to HermahsAPI with an array of links to download
export async function saveImages(arrayOfImgURLs: string[]) {
  const addDefamation = await fetch("https://api.hermahs.com/add_defamation", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      imageURLs: arrayOfImgURLs,
    }),
  });
  console.log(`Sent images to api`);
}

//Sends a defamation to the provided channelID
async function sendDefamation(client: Client<boolean>, channelId: string) {
  const channel = await client.channels.fetch(channelId);
  const attachment = await fetchDefamation();

  if (channel?.isTextBased() && attachment) {
    //Alternative: if (channel instanceof TextChannel)
    const messageOptions: MessageCreateOptions = {
      content: "cuca",
      files: [attachment],
    };
    await (channel as TextChannel).send(messageOptions);
  }
}

//Fetches a defamation image from HermahsAPI and returns an AttachmentBuilder object
export async function fetchDefamation(): Promise<AttachmentBuilder | null> {
  const response = await fetch(`https://api.hermahs.com/defamation`);
  const responseType = response.headers.get("content-type");
  let attachment: AttachmentBuilder | null = null;

  if (responseType === "image/png" || responseType === "image/jpeg") {
    try {
      const buffer = Buffer.from(await response.arrayBuffer());
      attachment = new AttachmentBuilder(buffer).setName(
        "hermahs-defamation" + "." + responseType.split("/")[1]
      );
    } catch (error) {
      console.error("Error ");
      return attachment;
    }
    return attachment;
  }
  return attachment;
}

export async function randomDefamationSend(
  client: Client<boolean>,
  channelId: string
): Promise<NodeJS.Timeout> {
  const intervalFunc: NodeJS.Timeout = setInterval(async () => {
    const randNumber: number = Math.random();
    if (randNumber <= 0.001) {
      console.log(`Generated number: ${randNumber}`);
      await sendDefamation(client, channelId);
    } else {
      console.log(`Not sent. Generated number: ${randNumber}`);
    }
  }, 3600000); //1 hour
  return intervalFunc;
}
