import {
  EmbedBuilder,
  AuditLogEvent
} from "discord.js";

import Logs from "../models/Logs.js";

export default {

  name: "guildBanRemove",

  async execute(ban) {

    try {

      const data =
        await Logs.findOne({
          guildId: ban.guild.id
        });

      if (!data) return;
      if (!data.logs.bans) return;

      const canal =
        ban.guild.channels.cache.get(
          data.channelId
        );

      if (!canal) return;

      // 🔍 Buscar responsable
      const logs =
        await ban.guild.fetchAuditLogs({

          type:
            AuditLogEvent.MemberBanRemove,

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

          .setColor("#57F287")

          .setAuthor({

            name:
              "🔓 Usuario Desbaneado",

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

      await canal.send({
        embeds: [embed]
      });

    } catch (error) {

      console.error(
        "❌ UNBAN LOG ERROR:",
        error
      );

    }

  }

};
