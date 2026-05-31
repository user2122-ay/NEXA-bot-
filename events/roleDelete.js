import {
  EmbedBuilder,
  AuditLogEvent
} from "discord.js";

import Logs from "../models/Logs.js";

export default {

  name: "roleDelete",

  async execute(role) {

    try {

      const data = await Logs.findOne({
        guildId: role.guild.id
      });
if (!data) return;

if (!data.logs.roles) return;

      const canal =
        role.guild.channels.cache.get(
          data.channelId
        );

      if (!canal) return;

      // 🔍 Buscar responsable
      let executor = null;

      try {

        const logs =
          await role.guild.fetchAuditLogs({

            type:
              AuditLogEvent.RoleDelete,

            limit: 1

          });

        executor =
          logs.entries.first()?.executor ||
          null;

      } catch {}

      const embed = new EmbedBuilder()

        .setColor("#ED4245")

        .setAuthor({

          name: "🗑️ Rol Eliminado",

          iconURL:
            role.guild.iconURL({
              dynamic: true
            }) || undefined

        })

        .addFields(

          {
            name: "🏷️ Nombre",
            value: role.name,
            inline: true
          },

          {
            name: "🆔 ID",
            value: `\`${role.id}\``,
            inline: true
          },

          {
            name: "🎨 Color",
            value:
              role.hexColor ||
              "Sin color",
            inline: true
          },

          {
            name: "📍 Posición",
            value:
              `${role.position}`,
            inline: true
          },

          {
            name: "🔑 Permisos",
            value:
              `${role.permissions.toArray().length}`,
            inline: true
          },

          {
            name: "🛡️ Eliminado por",
            value:
              executor
                ? `${executor}`
                : "Desconocido",
            inline: false
          }

        )

        .setFooter({

          text: role.guild.name,

          iconURL:
            role.guild.iconURL({
              dynamic: true
            }) || null

        })

        .setTimestamp();

      await canal.send({
        embeds: [embed]
      });

    } catch (error) {

      console.error(
        "❌ ROLE DELETE LOG ERROR:",
        error
      );

    }

  }

};
