import { MessageFlags, AuditLogEvent } from "discord.js";
import Logs from "../models/Logs.js";
import { buildLogContainer } from "../utils/componentsV2.js";

export default {

  name: "messageDelete",

  async execute(message) {

    try {

      if (!message.guild) return;
      if (message.author?.bot) return;

      const data = await Logs.findOne({
        guildId: message.guild.id
      });

      if (!data) return;
      if (!data.logs.messages) return;

      const canal = message.guild.channels.cache.get(data.channelId);

      if (!canal) return;

      // 🔍 Buscar responsable
      let executor = null;

      try {
        const logs = await message.guild.fetchAuditLogs({
          type: AuditLogEvent.MessageDelete,
          limit: 1
        });

        const entry = logs.entries.first();

        if (entry && entry.target?.id === message.author.id) {
          executor = entry.executor;
        }
      } catch {}

      const fields = [
        { name: "👤 Usuario", value: `${message.author}` },
        { name: "📍 Canal", value: `${message.channel}` },
        { name: "🆔 ID", value: `\`${message.author.id}\`` },
        { name: "🛡️ Eliminado por", value: executor ? `${executor}` : "Desconocido" }
      ];

      if (message.content) {
        fields.push({
          name: "💬 Contenido",
          value:
            message.content.length > 1024
              ? message.content.slice(0, 1020) + "..."
              : message.content
        });
      }

      const container = buildLogContainer({
        color: "#ED4245",
        title: "🔴 Mensaje Eliminado",
        fields,
        footer: message.guild.name
      });

      await canal.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: ["users"] }
      });

    } catch (error) {
      console.error("❌ LOG DELETE ERROR:", error);
    }

  }

};

