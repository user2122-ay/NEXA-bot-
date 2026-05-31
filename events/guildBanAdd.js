import {
  EmbedBuilder,
  AuditLogEvent
} from "discord.js";

import Logs from "../models/Logs.js";

export default {

  name: "guildBanAdd",

  async execute(ban) {

    try {

      const data =
        await Logs.findOne({

          guildId:
            ban.guild.id

        });

      if (!data) return;

      const logChannel =
        ban.guild.channels.cache.get(
          data.channelId
        );

      if (!logChannel) return;

      // 🔍 Buscar responsable
      const logs =
        await ban.guild.fetchAuditLogs({

          type:
            AuditLogEvent.MemberBanAdd,

          limit: 1

        });

      const entry =
        logs.entries.first();

      const executor =
        entry?.executor || null;

      const reason =
        entry?.reason ||
        "No especificada";

      const embed =
        new EmbedBuilder()

          .setColor("#ED4245")

          .setAuthor({

            name:
              "🔨 Usuario Baneado",

            iconURL:
              ban.user.displayAvatarURL({
                dynamic: true
              })

          })

          .setThumbnail(

            ban.user.displayAvatarURL({
              dynamic: true,
              size: 4096
            })

          )

          .addFields(

            {

              name:
                "👤 Usuario",

              value:
                `${ban.user}`,

              inline: true

            },

            {

              name:
                "🆔 ID",

              value:
                `\`${ban.user.id}\``,

              inline: true

            },

            {

              name:
                "🛡️ Moderador",

              value:
                executor
                  ? `${executor}`
                  : "Desconocido",

              inline: false

            },

            {

              name:
                "📄 Razón",

              value:
                reason,

              inline: false

            }

          )

          .setFooter({

            text:
              ban.guild.name,

            iconURL:
              ban.guild.iconURL({
                dynamic: true
              }) || undefined

          })

          .setTimestamp();

      await logChannel.send({

        embeds: [embed]

      });

    } catch (error) {

      console.error(
        "❌ BAN LOG ERROR:",
        error
      );

    }

  }

};
