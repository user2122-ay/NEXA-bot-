import { MessageFlags, AuditLogEvent } from "discord.js";
import Logs from "../models/Logs.js";
import { buildLogContainer } from "../utils/componentsV2.js";

export default {

  name: "roleUpdate",

  async execute(oldRole, newRole) {

    try {

      const data = await Logs.findOne({
        guildId: newRole.guild.id
      });

      if (!data) return;
      if (!data.logs.roles) return;

      const logChannel = newRole.guild.channels.cache.get(data.channelId);

      if (!logChannel) return;

      const cambios = [];

      if (oldRole.name !== newRole.name) {
        cambios.push(`📛 **Nombre**\n\`${oldRole.name}\` ➜ \`${newRole.name}\``);
      }

      if (oldRole.hexColor !== newRole.hexColor) {
        cambios.push(`🎨 **Color**\n\`${oldRole.hexColor}\` ➜ \`${newRole.hexColor}\``);
      }

      if (oldRole.mentionable !== newRole.mentionable) {
        cambios.push(
          `📢 **Mencionable**\n${oldRole.mentionable ? "Sí" : "No"} ➜ ${newRole.mentionable ? "Sí" : "No"}`
        );
      }

      const oldPerms = oldRole.permissions.toArray();
      const newPerms = newRole.permissions.toArray();

      const addedPerms = newPerms.filter(p => !oldPerms.includes(p));
      const removedPerms = oldPerms.filter(p => !newPerms.includes(p));

      if (addedPerms.length) {
        cambios.push(`✅ **Permisos añadidos**\n${addedPerms.slice(0, 10).join("\n")}`);
      }

      if (removedPerms.length) {
        cambios.push(`❌ **Permisos removidos**\n${removedPerms.slice(0, 10).join("\n")}`);
      }

      if (!cambios.length) return;

      // 🔍 Responsable
      let executor = null;

      try {
        const logs = await newRole.guild.fetchAuditLogs({
          type: AuditLogEvent.RoleUpdate,
          limit: 1
        });

        executor = logs.entries.first()?.executor || null;
      } catch {}

      const container = buildLogContainer({
        color: "#FEE75C",
        title: "🎭 Rol Actualizado",
        fields: [
          { name: "🏷️ Rol", value: `${newRole}` },
          { name: "🆔 ID", value: `\`${newRole.id}\`` },
          { name: "🛡️ Modificado por", value: executor ? `${executor}` : "Desconocido" },
          { name: "📝 Cambios", value: cambios.join("\n\n").slice(0, 1024) }
        ],
        footer: newRole.guild.name
      });

      await logChannel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: ["users"] }
      });

    } catch (error) {
      console.error("❌ ROLE UPDATE LOG ERROR:", error);
    }

  }

};
