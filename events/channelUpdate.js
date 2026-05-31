import {
  EmbedBuilder,
  AuditLogEvent
} from "discord.js";

import Logs from "../models/Logs.js";

export default {

  name: "channelUpdate",

  async execute(
    oldChannel,
    newChannel
  ) {

    try {

      if (
        oldChannel.name ===
        newChannel.name
      ) return;

      const data =
        await Logs.findOne({

          guildId:
            newChannel.guild.id

        });

      if (!data) return;
      if (!data.logs.channels) return;

      const logChannel =
        newChannel.guild.channels.cache.get(
          data.channelId
        );

      if (!logChannel) return;

      // 🔍 Buscar responsable
      const logs =
        await newChannel.guild.fetchAuditLogs({

          type:
            AuditLogEvent.ChannelUpdate,

          limit: 1

        });

      const entry =
        logs.entries.first();

      const executor =
        entry?.executor || null;

      const embed =
        new EmbedBuilder()

          .setColor("#FEE75C")

          .setAuthor({

            name:
              "🟡 Canal Actualizado",

            iconURL:
              newChannel.guild.iconURL({
                dynamic: true
              }) || undefined

          })

          .addFields(

            {

              name:
                "📢 Canal",

              value:
                `${newChannel}`,

              inline: true

            },

            {

              name:
                "📛 Nombre Anterior",

              value:
                `\`${oldChannel.name}\``,

              inline: false

            },

            {

              name:
                "✨ Nombre Nuevo",

              value:
                `\`${newChannel.name}\``,

              inline: false

            },

            {

              name:
                "🛡️ Modificado por",

              value:
                executor
                  ? `${executor}`
                  : "Desconocido",

              inline: false

            }

          )

          .setFooter({

            text:
              newChannel.guild.name,

            iconURL:
              newChannel.guild.iconURL({
                dynamic: true
              }) || undefined

          })

          .setTimestamp();

      await logChannel.send({

        embeds: [embed]

      });

    } catch (error) {

      console.error(

        "❌ CHANNEL UPDATE LOG ERROR:",

        error

      );

    }

  }

};
