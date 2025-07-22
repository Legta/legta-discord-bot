const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mc")
    .setDescription("Check the status of the Hermahs Territory server."),
  async execute(interaction) {
    const deferred = await interaction.deferReply();
    const serverAddress = "minecraft.hermahs.com";
    const statusApiRequest = await fetch(
      "https://api.mcstatus.io/v2/status/java/" + serverAddress
    );
    const response = await statusApiRequest.json();

    if (response.online === true) {
      const base64Icon = response.icon.startsWith("data:image")
        ? response.icon.split(",")[1]
        : response.icon;
      const icon = Buffer.from(base64Icon, "base64");
      const file = new AttachmentBuilder(icon, { name: "icon.png" });

      const reply = new EmbedBuilder()
        .setColor("#6EFFE8")
        .setTitle(`Hermahs Territory MC`)
        .setDescription("Status for the server:")
        .setThumbnail("attachment://icon.png")
        .setFooter({
          text: interaction.client.user.displayName,
          iconURL: interaction.client.user.avatarURL(),
        });

      if (response.players.online > 0) {
        const fields = [
          {
            name: "**Players online:** ",
            value: "",
          },
        ];
        response.players.list.forEach((player) => {
          fields.push({
            name: "👍 " + player.name_clean,
            value: "",
            inline: true,
          });
          reply.setFields(fields);
        });
      } else {
        reply.setFields([
          {
            name: "No players online!",
            value: "",
            inline: false,
          },
        ]);
      }

      if (statusApiRequest.headers.get("cf-cache-status") === "HIT") {
        reply.spliceFields(0, 0, {
          name: "**This data is most likely 1 minute old.**",
          value: "",
        });
      }

      reply.spliceFields(0, 0, {
        name: "The server is online! 🟢",
        value: response.motd.clean + "\nminecraft.hermahs.com",
      });

      interaction.followUp({
        embeds: [reply],
        files: [file],
      });
    } else {
      const reply = new EmbedBuilder()
        .setColor("#6EFFE8")
        .setTitle(`Hermahs Territory MC`)
        .setDescription("Status for the server:")
        .setFooter({
          text: interaction.client.user.displayName,
          iconURL: interaction.client.user.avatarURL(),
        })
        .setFields([
          {
            name: "**The server is offline. 🔴**",
            value: "Hermahs Territory\nminecraft.hermahs.com",
          },
        ]);

      if (statusApiRequest.headers.get("cf-cache-status") === "HIT") {
        reply.spliceFields(1, 0, {
          name: "**This data is most likely 1 minute old.**",
          value: "",
        });
      }

      interaction.followUp({
        embeds: [reply],
      });
    }
  },
};
