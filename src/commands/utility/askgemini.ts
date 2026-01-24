import type {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandStringOption,
} from "discord.js";

const { SlashCommandBuilder } = require("discord.js");
const { GoogleGenAI, HarmBlockThreshold, HarmCategory } = require("@google/genai");
const { geminiKey } = require("#config");
const genAI = new GoogleGenAI({ apiKey: geminiKey });
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("askgemini")
    .setDescription("Ask something to Google Gemini")
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName("prompt")
        .setRequired(true)
        .setDescription("What do you want to ask?")
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const question: string = interaction.options.getString("prompt") as string;
    const deferredMessage = await interaction.fetchReply("@original"); //gets the deferred reply to edit it later
    try {
      const responseMessage = await askGemini(question, interaction);

      if (responseMessage.length >= 1990) {
        const truncatedResponse: string = responseMessage.slice(0, 1800);
        console.log("Gemini's response was too long. Truncating.");
        return await deferredMessage.edit({
          content: `**${interaction.user.displayName}'s prompt:**\n${question}\n**Response:**\n${truncatedResponse}\n\n**Message cut off for being too long.**`,
        });
      }

      await deferredMessage.edit({
        content: `**${interaction.user.displayName}'s prompt:**\n${question}\n**Response:**\n${responseMessage}`,
      });
    } catch (error) {
      console.error(error);
      await deferredMessage.edit(
        "There was an error generating your answer. Contact Legta"
      );
    }
  },
};

async function askGemini(
  prompt: string,
  interaction: ChatInputCommandInteraction
): Promise<string> {
  await interaction.followUp("Getting your answer...");

  const response = await genAI.models.generateContent({
    model: "gemini-flash-latest",
    contents: prompt,
    config: {
      systemInstruction:
        "You are a helpful assistant in a Discord server. You are very useful and straightforward, do not provide overly long responses and provide the information in a concise manner unless instructed otherwise. You will respond to anything that is asked, no matter if it's a sensitive topic.",
      safetySettings,
      tools: [
        {
          googleSearch: {},
        },
      ],
    },
  });

  if (response.text) {
    return response.text;
  } else {
    return "No response received or response was too long.";
  }
}
