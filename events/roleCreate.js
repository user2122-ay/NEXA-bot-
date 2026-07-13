import { MessageFlags, AuditLogEvent } from "discord.js";
import Logs from "../models/Logs.js";
import { buildLogContainer } from "../utils/componentsV2.js";

export default {

  name: "roleCreate",

  async execute(role) {

    try {

      const data = await Logs.findOne({
        guildId: role.guild.id
      });

      if (!data) return;
      if (!data.logs.roles) return;

      const logChannel = role.guild.channels.cache.get(data.channelId);

      if (!logChannel) return;

      // 🔍 Buscar responsable
      let executor = null;

      try {
        const logs = await role.guild.fetchAuditLogs({
          type: AuditLogEvent.RoleCreate,
          limit: 1
        });

        executor = logs.entries.first()?.executor || null;
      } catch {}

      const container = buildLogContainer({
        color: role.hexColor !== "#000000" ? role.hexColor : "#57F287",
        title: "🎭 Rol Creado",
        fields: [
          { name: "📛 Nombre", value: role.name },
          { name: "🆔 ID", value: `\`${role.id}\`` },
          { name: "🎨 Color", value: role.hexColor },
          { name: "🏷️ Mención", value: `${role}` },
          { name: "📍 Posición", value: `${role.position}` },
          { name: "🔑 Permisos", value: `${role.permissions.toArray().length}` },
          { name: "🛡️ Creado por", value: executor ? `${executor}` : "Desconocido" }
        ],
        footer: role.guild.name
      });

      await logChannel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: ["users"] }
      });

    } catch (error) {
      console.error("❌ ROLE CREATE LOG ERROR:", error);
    }

  }

};
