import type { AttachmentBuilder, ChatInputCommandInteraction } from "discord.js";

const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder: AttachmentBuilderClass } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mc")
    .setDescription("Check the status of the Hermahs Territory server."),
  async execute(interaction: ChatInputCommandInteraction) {
    const deferred = await interaction.deferReply();
    const serverAddress = "minecraft.hermahs.com";
    const statusApiRequest = await fetch(
      "https://api.mcstatus.io/v2/status/java/" + serverAddress
    );
    const response: ApiJsonResponse = await statusApiRequest.json() as ApiJsonResponse;

    if (response.online) {

      let file: AttachmentBuilder | null = null

      if (response.icon) {
        const base64Icon = response.icon?.startsWith("data:image")
          ? response.icon.split(",")[1]
          : response.icon;
        const icon = Buffer.from(base64Icon, "base64");
        file = new AttachmentBuilderClass(icon, { name: "icon.png" });
      }

      const reply = new EmbedBuilder()
        .setColor("#6EFFE8")
        .setTitle(`Hermahs Territory MC`)
        .setDescription("Status for the server:")
        .setThumbnail("attachment://icon.png")
        .setFooter({
          text: interaction.client.user.displayName,
          iconURL: interaction.client.user.avatarURL() as string,
        });

      if (response.players && response.players.online > 0) {
        const fields = [
          {
            name: "**Players online:** ",
            value: "",
            inline: false
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
        value: response.motd?.clean + "\nminecraft.hermahs.com",
      });

      interaction.followUp({
        embeds: [reply],
        files: file ? [file] : [],
      });
    } else {
      const reply = new EmbedBuilder()
        .setColor("#6EFFE8")
        .setTitle(`Hermahs Territory MC`)
        .setDescription("Status for the server:")
        .setFooter({
          text: interaction.client.user.displayName,
          iconURL: interaction.client.user.avatarURL() as string,
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

interface Player {
  uuid: string;
  name_raw: string;
  name_clean: string;
  name_html: string;
}

interface Mod {
  name: string;
  version: string;
}

interface Plugin {
  name: string;
  version: string | null;
}

interface SrvRecord {
  host: string;
  port: number;
}

interface ApiJsonResponse {
  online: boolean;
  host: string;
  port: number;
  ip_address: string | null;
  eula_blocked: boolean;
  retrieved_at: number;
  expires_at: number;
  version?: {
    name_raw: string;
    name_clean: string;
    name_html: string;
    protocol: number;
  };
  players?: {
    online: number;
    max: number;
    list: Player[];
  };
  motd?: {
    raw: string;
    clean: string;
    html: string;
  };
  icon: string | null;
  mods?: Mod[];
  software?: string | null;
  plugins?: Plugin[];
  srv_record: SrvRecord | null;
}
