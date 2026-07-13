import { MessageFlags, AuditLogEvent } from "discord.js";
import Logs from "../models/Logs.js";
import { buildLogContainer } from "../utils/componentsV2.js";

export default {

  name: "guildBanRemove",

  async execute(ban) {

    try {

      const data = await Logs.findOne({
        guildId: ban.guild.id
      });

      if (!data) return;
      if (!data.logs.bans) return;

      const canal = ban.guild.channels.cache.get(data.channelId);

      if (!canal) return;

      // 🔍 Buscar responsable
      const logs = await ban.guild.fetchAuditLogs({
        type: AuditLogEvent.MemberBanRemove,
        limit: 1
      });

      const entry = logs.entries.first();
      const executor = entry?.executor || null;
      const reason = entry?.reason || "No especificada";

      const container = buildLogContainer({
        color: "#57F287",
        title: "🔓 Usuario Desbaneado",
        thumbnail: ban.user.displayAvatarURL({ dynamic: true, size: 4096 }),
        fields: [
          { name: "👤 Usuario", value: `${ban.user}` },
          { name: "🆔 ID", value: `\`${ban.user.id}\`` },
          { name: "🛡️ Moderador", value: executor ? `${executor}` : "Desconocido" },
          { name: "📄 Razón", value: reason }
        ],
        footer: ban.guild.name
      });

      await canal.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: ["users"] }
      });

    } catch (error) {
      console.error("❌ UNBAN LOG ERROR:", error);
    }

  }

};

