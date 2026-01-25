import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";

import { fetchDefamation } from "#functions";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("defamation")
    .setDescription("Shows a random hermahs defamation")
    .addIntegerOption((option) =>
      option
        .setName("number")
        .setDescription("Specify the number of the defamation you want to see")
        .setRequired(false),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    await interaction.followUp("Defamating rn...");
    const deferredMessage = await interaction.fetchReply("@original"); //gets the deferred reply to edit it later
    const number = interaction.options.getInteger("number");
    const { attachment, number: defNumber } = await fetchDefamation(number ? number : -1);
    if (attachment) {
      await deferredMessage.edit({
        content: defNumber !== null ? `Defamation #${defNumber}` : "Defamation",
        files: [attachment],
      });
    } else {
      await deferredMessage.edit({
        content: "Failed to fetch defamation.",
      });
    }
  },
};
