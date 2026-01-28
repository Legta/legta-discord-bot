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
  const { attachment, number } = await fetchDefamation();

  if (channel?.isTextBased() && attachment?.attachment) {
    const messageOptions: MessageCreateOptions = {
      content: `Defamation #${number}`,
      files: [attachment],
    };
    await (channel as TextChannel).send(messageOptions);
  } else {
    console.log("Tried to send automated defamation but failed.");
  }
}

//Fetches a defamation image from HermahsAPI and returns an AttachmentBuilder object and the number
export async function fetchDefamation(
  number: number = -1,
): Promise<{ attachment: AttachmentBuilder | null; number: number }> {
  const response = await fetch(
    `https://api.hermahs.com/defamation${number !== -1 ? `?file=${number}` : ""}`,
  );
  const responseType = response.headers.get("content-type");
  let attachment: AttachmentBuilder | null = null;
  let defNumber: number = parseInt(
    response.headers.get("Defamation-Number") as string,
  );

  const validResponseTypes: string[] = [
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "video/mpeg",
    "video/mp4",
    "video/webm",
  ];

  if (
    responseType &&
    validResponseTypes.find((value) => value === responseType) !== undefined
  ) {
    try {
      const buffer = Buffer.from(await response.arrayBuffer());
      attachment = new AttachmentBuilder(buffer).setName(
        "hermahs-defamation" + "." + responseType.split("/")[1],
      );
    } catch (error) {
      console.error("Error ");
      return { attachment, number: defNumber };
    }
    return { attachment, number: defNumber };
  }
  return { attachment, number: defNumber };
}

export async function randomDefamationSend(
  client: Client<boolean>,
  channelId: string,
): Promise<NodeJS.Timeout> {
  const intervalFunc: NodeJS.Timeout = setInterval(async () => {
    const randNumber: number = Math.random();
    if (randNumber <= 0.05) {
      console.log(`Sent defamation. Generated number: ${randNumber}`);
      await sendDefamation(client, channelId);
    } else {
      console.log(`Did not send defamation. Generated number: ${randNumber}`);
    }
  }, 3600000 / 2); //1 hour divided by half so half an hour, divided it cause i didnt wanna do the mental math
  return intervalFunc;
}
