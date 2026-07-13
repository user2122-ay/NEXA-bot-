import { MessageFlags } from "discord.js";
import Logs from "../models/Logs.js";
import { buildLogContainer } from "../utils/componentsV2.js";

export default {

  name: "messageUpdate",

  async execute(oldMessage, newMessage) {

    try {

      if (!newMessage.guild) return;
      if (newMessage.author?.bot) return;
      if (oldMessage.content === newMessage.content) return;

      const data = await Logs.findOne({
        guildId: newMessage.guild.id
      });

      if (!data) return;
      if (!data.logs.messages) return;

      const canal = newMessage.guild.channels.cache.get(data.channelId);

      if (!canal) return;

      const before = oldMessage.content || "Sin contenido";
      const after = newMessage.content || "Sin contenido";

      const container = buildLogContainer({
        color: "#FEE75C",
        title: "📝 Mensaje Editado",
        fields: [
          { name: "👤 Usuario", value: `${newMessage.author}` },
          { name: "📍 Canal", value: `${newMessage.channel}` },
          { name: "🆔 ID", value: `\`${newMessage.author.id}\`` },
          { name: "📝 Antes", value: "```" + before.slice(0, 1500) + "```" },
          { name: "✏️ Después", value: "```" + after.slice(0, 1500) + "```" }
        ],
        footer: newMessage.guild.name
      });

      await canal.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: ["users"] }
      });

    } catch (error) {
      console.error("❌ LOG UPDATE ERROR:", error);
    }

  }

};

