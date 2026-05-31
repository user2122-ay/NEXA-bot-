import {
  EmbedBuilder,
  AuditLogEvent
} from "discord.js";

import Logs from "../models/Logs.js";

export default {

  name: "messageDelete",

  async execute(message) {

    try {

      if (!message.guild) return;

      if (message.author?.bot) return;

      const data =
        await Logs.findOne({
          guildId: message.guild.id
        });

      if (!data) return;

if (!data.logs.messages) return;

      const canal =
        message.guild.channels.cache.get(
          data.channelId
        );

      if (!canal) return;

      // 🔍 Buscar responsable
      let executor = null;

      try {

        const logs =
          await message.guild.fetchAuditLogs({

            type:
              AuditLogEvent.MessageDelete,

            limit: 1

          });

        const entry =
          logs.entries.first();

        if (
          entry &&
          entry.target?.id ===
            message.author.id
        ) {

          executor =
            entry.executor;

        }

      } catch {}

      const embed =
        new EmbedBuilder()

          .setColor("#ED4245")

          .setAuthor({

            name:
              "🔴 Mensaje Eliminado",

            iconURL:
              message.author.displayAvatarURL({
                dynamic: true
              })

          })

          .addFields(

            {
              name: "👤 Usuario",
              value: `${message.author}`,
              inline: true
            },

            {
              name: "📍 Canal",
              value: `${message.channel}`,
              inline: true
            },

            {
              name: "🆔 ID",
              value:
                `\`${message.author.id}\``,
              inline: true
            },

            {
              name:
                "🛡️ Eliminado por",

              value:
                executor
                  ? `${executor}`
                  : "Desconocido",

              inline: false
            }

          )

          .setFooter({

            text:
              message.guild.name,

            iconURL:
              message.guild.iconURL({
                dynamic: true
              }) || null

          })

          .setTimestamp();

      if (message.content) {

        embed.addFields({

          name:
            "💬 Contenido",

          value:
            message.content.length >
            1024

              ? message.content.slice(
                  0,
                  1020
                ) + "..."

              : message.content

        });

      }

      await canal.send({
        embeds: [embed]
      });

    } catch (error) {

      console.error(
        "❌ LOG DELETE ERROR:",
        error
      );

    }

  }

};
