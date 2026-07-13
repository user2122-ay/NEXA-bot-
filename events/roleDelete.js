import { MessageFlags, AuditLogEvent } from "discord.js";
import Logs from "../models/Logs.js";
import { buildLogContainer } from "../utils/componentsV2.js";

export default {

  name: "roleDelete",

  async execute(role) {

    try {

      const data = await Logs.findOne({
        guildId: role.guild.id
      });

      if (!data) return;
      if (!data.logs.roles) return;

      const canal = role.guild.channels.cache.get(data.channelId);

      if (!canal) return;

      // 🔍 Buscar responsable
      let executor = null;

      try {
        const logs = await role.guild.fetchAuditLogs({
          type: AuditLogEvent.RoleDelete,
          limit: 1
        });

        executor = logs.entries.first()?.executor || null;
      } catch {}

      const container = buildLogContainer({
        color: "#ED4245",
        title: "🗑️ Rol Eliminado",
        fields: [
          { name: "🏷️ Nombre", value: role.name },
          { name: "🆔 ID", value: `\`${role.id}\`` },
          { name: "🎨 Color", value: role.hexColor || "Sin color" },
          { name: "📍 Posición", value: `${role.position}` },
          { name: "🔑 Permisos", value: `${role.permissions.toArray().length}` },
          { name: "🛡️ Eliminado por", value: executor ? `${executor}` : "Desconocido" }
        ],
        footer: role.guild.name
      });

      await canal.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: ["users"] }
      });

    } catch (error) {
      console.error("❌ ROLE DELETE LOG ERROR:", error);
    }

  }

};

