import { MessageFlags } from "discord.js";
import Logs from "../models/Logs.js";
import { buildLogContainer } from "../utils/componentsV2.js";

export default {

  name: "guildMemberUpdate",

  async execute(oldMember, newMember) {

    try {

      const data = await Logs.findOne({
        guildId: newMember.guild.id
      });

      if (!data) return;

      const canal = newMember.guild.channels.cache.get(data.channelId);

      if (!canal) return;

      // 🔍 Audit Logs
      let executor = null;

      try {
        const audit = await newMember.guild.fetchAuditLogs({ limit: 1 });
        executor = audit.entries.first()?.executor || null;
      } catch {}

      const enviar = (container) =>
        canal.send({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
          // 🔇 Se ven las menciones de rol, pero no notifican
          allowedMentions: { parse: ["users"] }
        });

      // 🟢 ROLES AGREGADOS
      const addedRoles = newMember.roles.cache.filter(
        role => !oldMember.roles.cache.has(role.id)
      );

      if (data.logs.roles && addedRoles.size > 0) {

        const container = buildLogContainer({
          color: "#57F287",
          title: "🟢 Roles Agregados",
          thumbnail: newMember.user.displayAvatarURL({ dynamic: true }),
          fields: [
            { name: "👤 Usuario", value: `${newMember}` },
            { name: "📋 Roles", value: addedRoles.map(r => r.toString()).join("\n").slice(0, 1024) },
            { name: "🛡️ Modificado por", value: executor ? `${executor}` : "Desconocido" }
          ],
          footer: newMember.guild.name
        });

        await enviar(container);
      }

      // 🔴 ROLES REMOVIDOS
      const removedRoles = oldMember.roles.cache.filter(
        role => !newMember.roles.cache.has(role.id)
      );

      if (data.logs.roles && removedRoles.size > 0) {

        const container = buildLogContainer({
          color: "#ED4245",
          title: "🔴 Roles Removidos",
          thumbnail: newMember.user.displayAvatarURL({ dynamic: true }),
          fields: [
            { name: "👤 Usuario", value: `${newMember}` },
            { name: "📋 Roles", value: removedRoles.map(r => r.toString()).join("\n").slice(0, 1024) },
            { name: "🛡️ Modificado por", value: executor ? `${executor}` : "Desconocido" }
          ],
          footer: newMember.guild.name
        });

        await enviar(container);
      }

      // 📝 APODO
      if (data.logs.nicknames && oldMember.nickname !== newMember.nickname) {

        const container = buildLogContainer({
          color: "#FEE75C",
          title: "🟡 Apodo Actualizado",
          thumbnail: newMember.user.displayAvatarURL({ dynamic: true }),
          fields: [
            { name: "👤 Usuario", value: `${newMember}` },
            { name: "📛 Antes", value: oldMember.nickname || "Sin apodo" },
            { name: "✨ Después", value: newMember.nickname || "Sin apodo" },
            { name: "🛡️ Modificado por", value: executor ? `${executor}` : "Desconocido" }
          ],
          footer: newMember.guild.name
        });

        await enviar(container);
      }

      // 🔇 TIMEOUT APLICADO
      if (
        data.logs.timeouts &&
        !oldMember.communicationDisabledUntil &&
        newMember.communicationDisabledUntil
      ) {

        const container = buildLogContainer({
          color: "#ED4245",
          title: "🔇 Timeout Aplicado",
          thumbnail: newMember.user.displayAvatarURL({ dynamic: true }),
          fields: [
            { name: "👤 Usuario", value: `${newMember}` },
            {
              name: "🕒 Finaliza",
              value: `<t:${Math.floor(new Date(newMember.communicationDisabledUntil).getTime() / 1000)}:F>`
            },
            { name: "🛡️ Moderador", value: executor ? `${executor}` : "Desconocido" }
          ]
        });

        await enviar(container);
      }

      // 🔊 TIMEOUT REMOVIDO
      if (
        data.logs.timeouts &&
        oldMember.communicationDisabledUntil &&
        !newMember.communicationDisabledUntil
      ) {

        const container = buildLogContainer({
          color: "#57F287",
          title: "🔊 Timeout Removido",
          thumbnail: newMember.user.displayAvatarURL({ dynamic: true }),
          fields: [
            { name: "👤 Usuario", value: `${newMember}` },
            { name: "🛡️ Moderador", value: executor ? `${executor}` : "Desconocido" }
          ]
        });

        await enviar(container);
      }

    } catch (error) {
      console.error("❌ LOG ROLE ERROR:", error);
    }

  }

};
