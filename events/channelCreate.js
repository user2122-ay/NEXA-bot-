import { MessageFlags } from "discord.js";
import Logs from "../models/Logs.js";
import { buildLogContainer } from "../utils/componentsV2.js";

export default {

  name: "channelCreate",

  async execute(channel) {

    try {

      if (!channel.guild) return;

      const data = await Logs.findOne({
        guildId: channel.guild.id
      });

      if (!data) return;
      if (!data.logs.channels) return;

      const logChannel = channel.guild.channels.cache.get(data.channelId);

      if (!logChannel) return;

      // 🔍 Buscar responsable
      const logs = await channel.guild.fetchAuditLogs({
        type: 10,
        limit: 1
      });

      const entry = logs.entries.first();
      const executor = entry?.executor || null;

      const container = buildLogContainer({
        color: "#57F287",
        title: "📁 Canal Creado",
        fields: [
          { name: "📢 Canal", value: `${channel}` },
          { name: "🆔 ID", value: `\`${channel.id}\`` },
          { name: "📂 Tipo", value: `${channel.type}` },
          { name: "🛡️ Creado por", value: executor ? `${executor}` : "Desconocido" }
        ],
        footer: channel.guild.name
      });

      await logChannel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
        // 🔇 Que se vean las menciones de rol pero no notifiquen (sí notifica al usuario)
        allowedMentions: { parse: ["users"] }
      });

    } catch (error) {
      console.error("❌ CHANNEL CREATE LOG ERROR:", error);
    }

  }

};

