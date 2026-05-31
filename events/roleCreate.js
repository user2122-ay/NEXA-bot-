import {
  EmbedBuilder,
  AuditLogEvent
} from "discord.js";

import Logs from "../models/Logs.js";

export default {

  name: "roleCreate",

  async execute(role) {

    try {

      const data = await Logs.findOne({
        guildId: role.guild.id
      });

      if (!data) return;

if (!data.logs.roles) return;
      
      const logChannel =
        role.guild.channels.cache.get(
          data.channelId
        );

      if (!logChannel) return;

      // 🔍 Buscar responsable
      let executor = null;

      try {

        const logs =
          await role.guild.fetchAuditLogs({

            type:
              AuditLogEvent.RoleCreate,

            limit: 1

          });

        executor =
          logs.entries.first()?.executor ||
          null;

      } catch {}

      const embed = new EmbedBuilder()

        .setColor(role.hexColor !== "#000000"
          ? role.hexColor
          : "#57F287")

        .setAuthor({

          name: "🎭 Rol Creado",

          iconURL:
            role.guild.iconURL({
              dynamic: true
            }) || undefined

        })

        .addFields(

          {
            name: "📛 Nombre",
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
            value: role.hexColor,
            inline: true
          },

          {
            name: "🏷️ Mención",
            value: `${role}`,
            inline: true
          },

          {
            name: "📍 Posición",
            value: `${role.position}`,
            inline: true
          },

          {
            name: "🔑 Permisos",
            value:
              `${role.permissions.toArray().length}`,
            inline: true
          },

          {
            name: "🛡️ Creado por",
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

      await logChannel.send({
        embeds: [embed]
      });

    } catch (error) {

      console.error(
        "❌ ROLE CREATE LOG ERROR:",
        error
      );

    }

  }

};
