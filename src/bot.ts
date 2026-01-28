/*
 * Arguments:
 * --testing //starts the bot in test mode (meaning that it starts the slipi-test bot instead of the main one)
 */

// Require the necessary discord.js classes
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  ActivityType,
  Attachment,
} from "discord.js";
import { token, testingBotToken } from "#config";
import { randomDefamationSend, saveImages } from "#functions";
import { Reaction } from "./types/types";
// Require Node.js filesystem and path properties to be able to read directories and identify files. path helps construct paths to access files and directories. One of the advantages of the path module is that it automatically detects the operating system and uses the appropriate joiners.
import fs from "node:fs";
import path from "node:path";

let testMode = false;
if (process.argv.length > 2) {
  if (process.argv[2].toLowerCase() === "--testing") testMode = true;
}

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
  ],
}); //some of these intents need to be enabled in the discord developer portal

client.commands = new Collection();

//Variables for status changing interval
let presenceIntervalFunc: NodeJS.Timeout;
let currentPresenceIndex = 0;

//Random defamation send interval
let randomDefamationIntervalFunc: NodeJS.Timeout;

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  changePresence();
  //Main hermahs server #general ID: 1191122532619792457
  //Test server #testing ID: 1203856458379427861
  randomDefamationIntervalFunc = await randomDefamationSend(
    readyClient,
    "1203856458379427861",
  );
});

presenceIntervalFunc = setInterval(() => {
  changePresence();
}, 900000); //15min

function changePresence() {
  const names = [
    "Dubby",
    "Legta",
    "Swadley",
    "Habatwo",
    "Rubi",
    "Zettyns",
    "Joy",
    "Seikuz",
  ];

  const maxIndex = names.length - 1;
  const nameToDisplay = names[currentPresenceIndex];

  client.user?.setPresence({
    activities: [
      {
        name: `Killing ${nameToDisplay}... /say to make me talk`,
        type: ActivityType.Custom,
      },
    ],
    status: "dnd",
  });

  currentPresenceIndex++;
  if (currentPresenceIndex > maxIndex) currentPresenceIndex = 0;
}

// Log in to Discord with your client's token
client.login(testMode ? testingBotToken : token);

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  //for loop to get the filepath of the commands files
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
      );
    }
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  //using .on() method as listener for the interaction. The interaction is "Events.InteractionCreate" then execute the specified function
  if (interaction.isChatInputCommand()) {
    //if statement to check if the interaction received by the bot is a slash command. If it is not, just exit the function
    const command = interaction.client.commands.get(interaction.commandName); //this finds the command that was inputted by the user. "interaction.client" lets you use the Client instance. .commands is the collection created earlier which holds the commands. .get() is a method provided by the Collections imported class used to find the command. We pass the interaction.commandName property to this method to find the command name https://discordjs.guide/creating-your-bot/command-handling.html#executing-commands
    if (!command) {
      /* falsy condition, if the command provided is not in the client.commands collection it will be falsy and execute this block. */
      console.log(`${command} was not found in the commands collection`);
    }
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command.",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command.",
          ephemeral: true,
        });
      }
    }
  } else if (interaction.isAutocomplete()) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`,
      );
      return;
    }

    try {
      await command.autocomplete(interaction);
    } catch (error) {
      console.error(error);
    }
  } else if (interaction.isContextMenuCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);
    try {
      await command.execute(interaction);
    } catch (error) {
      interaction.reply({
        content: "There was an issue executing this command.",
        ephemeral: true,
      });
    }
  }
});

client.on("messageCreate", async (interaction) => {
  if (interaction.author.bot) return;

  // Bot testing server ID: 1201681485808009249
  // Bot testing channel ID: 1203856458379427861

  // Main server ID: 1191122530203869224
  // Main server channel: 1251000336865558689

  if (
    interaction.channelId === "1251000336865558689" &&
    interaction.guildId === "1191122530203869224"
  ) {
    //For specific humiliations channel in legtas gaming server
    try {
      const messageAttachments: Attachment[] = interaction.attachments.toJSON();

      if (messageAttachments.length > 0) {
        console.log("new humiliation detected.")
        const imageURLsToPush: string[] = [];
        messageAttachments.forEach((attachment) => {
          console.log(attachment.proxyURL);
          imageURLsToPush.push(attachment.proxyURL);
        });
        await saveImages(imageURLsToPush);
        interaction.react("✅");
      }
    } catch (error) {
      console.error(error);
      interaction.react("❌");
    }
  }

  if (
    interaction.guild &&
    fs.existsSync(
      path.join(
        __dirname,
        "guild-data",
        interaction.guild.id,
        "responses.json",
      ),
    )
  ) {
    const readData: Reaction[] = JSON.parse(
      fs.readFileSync(
        path.join(
          __dirname,
          "guild-data",
          interaction.guild.id,
          "responses.json",
        ),
      ) as unknown as string,
    );
    const matchIndexes: number[] = [];
    readData.forEach((el: Reaction, index: number) => {
      if (interaction.content.toLowerCase().includes(el.message)) {
        matchIndexes.push(index);
      }
    });
    for (let i = 0; i < matchIndexes.length; i++) {
      if (readData[matchIndexes[i]].type === "emoji") {
        await interaction.react(readData[matchIndexes[i]].response);
        console.log(
          `Reacted with ${readData[matchIndexes[i]].response} to "${
            interaction.content
          }" by ${interaction.author.globalName}`,
        );
      } else if (readData[matchIndexes[i]].type === "text-reply") {
        await interaction.reply({
          content: readData[matchIndexes[i]].response,
          allowedMentions: { repliedUser: false },
        }); //https://old.discordjs.dev/#/docs/discord.js/main/typedef/BaseMessageOptions
        console.log(
          `Replied with ${readData[matchIndexes[i]].response} to "${
            interaction.content
          }" by ${interaction.author.globalName}`,
        );
      }
    }
  }
});

client.on("error", (error) => {
  console.error("Discord.js client error: ", error);
});

process.on("SIGINT", async () => {
  console.log("Gracefully exiting bot...");
  clearInterval(presenceIntervalFunc);
  clearInterval(randomDefamationIntervalFunc);
  await client.destroy();
});

process.on("SIGTERM", async () => {
  console.log("Gracefully exiting bot...");
  clearInterval(presenceIntervalFunc);
  clearInterval(randomDefamationIntervalFunc);
  await client.destroy();
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection at: ", promise, "reason:", reason);
  clearInterval(presenceIntervalFunc);
  clearInterval(randomDefamationIntervalFunc);
  process.exit(1);
});
