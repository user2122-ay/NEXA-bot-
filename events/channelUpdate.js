import { MessageFlags, AuditLogEvent } from "discord.js";
import Logs from "../models/Logs.js";
import { buildLogContainer } from "../utils/componentsV2.js";

export default {

  name: "channelUpdate",

  async execute(oldChannel, newChannel) {

    try {

      if (oldChannel.name === newChannel.name) return;

      const data = await Logs.findOne({
        guildId: newChannel.guild.id
      });

      if (!data) return;
      if (!data.logs.channels) return;

      const logChannel = newChannel.guild.channels.cache.get(data.channelId);

      if (!logChannel) return;

      // 🔍 Buscar responsable
      const logs = await newChannel.guild.fetchAuditLogs({
        type: AuditLogEvent.ChannelUpdate,
        limit: 1
      });

      const entry = logs.entries.first();
      const executor = entry?.executor || null;

      const container = buildLogContainer({
        color: "#FEE75C",
        title: "🟡 Canal Actualizado",
        fields: [
          { name: "📢 Canal", value: `${newChannel}` },
          { name: "📛 Nombre Anterior", value: `\`${oldChannel.name}\`` },
          { name: "✨ Nombre Nuevo", value: `\`${newChannel.name}\`` },
          { name: "🛡️ Modificado por", value: executor ? `${executor}` : "Desconocido" }
        ],
        footer: newChannel.guild.name
      });

      await logChannel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: ["users"] }
      });

    } catch (error) {
      console.error("❌ CHANNEL UPDATE LOG ERROR:", error);
    }

  }

};

