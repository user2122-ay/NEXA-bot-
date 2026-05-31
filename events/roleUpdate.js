import {
  EmbedBuilder,
  AuditLogEvent
} from "discord.js";

import Logs from "../models/Logs.js";

export default {

  name: "roleUpdate",

  async execute(oldRole, newRole) {

    try {

      const data = await Logs.findOne({
        guildId: newRole.guild.id
      });

      if (!data) return;

if (!data.logs.roles) return;

      const logChannel =
        newRole.guild.channels.cache.get(
          data.channelId
        );

      if (!logChannel) return;

      const cambios = [];

      // 📛 Nombre
      if (
        oldRole.name !==
        newRole.name
      ) {

        cambios.push(
          `📛 **Nombre**\n\`${oldRole.name}\` ➜ \`${newRole.name}\``
        );

      }

      // 🎨 Color
      if (
        oldRole.hexColor !==
        newRole.hexColor
      ) {

        cambios.push(
          `🎨 **Color**\n\`${oldRole.hexColor}\` ➜ \`${newRole.hexColor}\``
        );

      }

      // 📢 Mencionable
      if (
        oldRole.mentionable !==
        newRole.mentionable
      ) {

        cambios.push(
          `📢 **Mencionable**\n${
            oldRole.mentionable
              ? "Sí"
              : "No"
          } ➜ ${
            newRole.mentionable
              ? "Sí"
              : "No"
          }`
        );

      }

      // 🔑 Permisos
      const oldPerms =
        oldRole.permissions.toArray();

      const newPerms =
        newRole.permissions.toArray();

      const addedPerms =
        newPerms.filter(
          p => !oldPerms.includes(p)
        );

      const removedPerms =
        oldPerms.filter(
          p => !newPerms.includes(p)
        );

      if (addedPerms.length) {

        cambios.push(
          `✅ **Permisos añadidos**\n${addedPerms
            .slice(0, 10)
            .join("\n")}`
        );

      }

      if (removedPerms.length) {

        cambios.push(
          `❌ **Permisos removidos**\n${removedPerms
            .slice(0, 10)
            .join("\n")}`
        );

      }

      if (!cambios.length) return;

      // 🔍 Responsable
      let executor = null;

      try {

        const logs =
          await newRole.guild.fetchAuditLogs({

            type:
              AuditLogEvent.RoleUpdate,

            limit: 1

          });

        executor =
          logs.entries.first()?.executor ||
          null;

      } catch {}

      const embed = new EmbedBuilder()

        .setColor("#FEE75C")

        .setAuthor({

          name:
            "🎭 Rol Actualizado",

          iconURL:
            newRole.guild.iconURL({
              dynamic: true
            }) || undefined

        })

        .addFields(

          {
            name: "🏷️ Rol",
            value: `${newRole}`,
            inline: true
          },

          {
            name: "🆔 ID",
            value: `\`${newRole.id}\``,
            inline: true
          },

          {
            name:
              "🛡️ Modificado por",

            value:
              executor
                ? `${executor}`
                : "Desconocido",

            inline: false
          },

          {
            name: "📝 Cambios",
            value:
              cambios.join("\n\n")
                .slice(0, 1024)
          }

        )

        .setFooter({

          text:
            newRole.guild.name,

          iconURL:
            newRole.guild.iconURL({
              dynamic: true
            }) || null

        })

        .setTimestamp();

      await logChannel.send({
        embeds: [embed]
      });

    } catch (error) {

      console.error(
        "❌ ROLE UPDATE LOG ERROR:",
        error
      );

    }

  }

};
