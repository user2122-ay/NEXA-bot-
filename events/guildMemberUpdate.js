import {
  EmbedBuilder,
  AuditLogEvent
} from "discord.js";

import Logs from "../models/Logs.js";

export default {

  name: "guildMemberUpdate",

  async execute(oldMember, newMember) {

    try {

      const data = await Logs.findOne({
        guildId: newMember.guild.id
      });

      if (!data) return;

      const canal =
        newMember.guild.channels.cache.get(
          data.channelId
        );

      if (!canal) return;

      // 🔍 Audit Logs
      let executor = null;

      try {

        const audit =
          await newMember.guild.fetchAuditLogs({
            limit: 1
          });

        executor =
          audit.entries.first()?.executor ||
          null;

      } catch {}

      // =====================
      // 🟢 ROLES AGREGADOS
      // =====================

      const addedRoles =
        newMember.roles.cache.filter(
          role =>
            !oldMember.roles.cache.has(
              role.id
            )
        );

      if (addedRoles.size > 0) {

        const embed = new EmbedBuilder()

          .setColor("#57F287")

          .setAuthor({
            name: "🟢 Roles Agregados",
            iconURL:
              newMember.user.displayAvatarURL({
                dynamic: true
              })
          })

          .addFields(

            {
              name: "👤 Usuario",
              value: `${newMember}`,
              inline: true
            },

            {
              name: "📋 Roles",
              value:
                addedRoles
                  .map(r => r.toString())
                  .join("\n")
                  .slice(0, 1024)
            },

            {
              name: "🛡️ Modificado por",
              value:
                executor
                  ? `${executor}`
                  : "Desconocido"
            }

          )

          .setFooter({
            text: newMember.guild.name,
            iconURL:
              newMember.guild.iconURL({
                dynamic: true
              }) || null
          })

          .setTimestamp();

        await canal.send({
          embeds: [embed]
        });

      }

      // =====================
      // 🔴 ROLES REMOVIDOS
      // =====================

      const removedRoles =
        oldMember.roles.cache.filter(
          role =>
            !newMember.roles.cache.has(
              role.id
            )
        );

      if (removedRoles.size > 0) {

        const embed = new EmbedBuilder()

          .setColor("#ED4245")

          .setAuthor({
            name: "🔴 Roles Removidos",
            iconURL:
              newMember.user.displayAvatarURL({
                dynamic: true
              })
          })

          .addFields(

            {
              name: "👤 Usuario",
              value: `${newMember}`,
              inline: true
            },

            {
              name: "📋 Roles",
              value:
                removedRoles
                  .map(r => r.toString())
                  .join("\n")
                  .slice(0, 1024)
            },

            {
              name: "🛡️ Modificado por",
              value:
                executor
                  ? `${executor}`
                  : "Desconocido"
            }

          )

          .setFooter({
            text: newMember.guild.name,
            iconURL:
              newMember.guild.iconURL({
                dynamic: true
              }) || null
          })

          .setTimestamp();

        await canal.send({
          embeds: [embed]
        });

      }

      // =====================
      // 📝 APODO
      // =====================

      if (
        oldMember.nickname !==
        newMember.nickname
      ) {

        const embed =
          new EmbedBuilder()

            .setColor("#FEE75C")

            .setAuthor({
              name:
                "🟡 Apodo Actualizado",
              iconURL:
                newMember.user.displayAvatarURL({
                  dynamic: true
                })
            })

            .addFields(

              {
                name: "👤 Usuario",
                value: `${newMember}`,
                inline: true
              },

              {
                name: "📛 Antes",
                value:
                  oldMember.nickname ||
                  "Sin apodo"
              },

              {
                name: "✨ Después",
                value:
                  newMember.nickname ||
                  "Sin apodo"
              },

              {
                name:
                  "🛡️ Modificado por",
                value:
                  executor
                    ? `${executor}`
                    : "Desconocido"
              }

            )

            .setFooter({
              text:
                newMember.guild.name,
              iconURL:
                newMember.guild.iconURL({
                  dynamic: true
                }) || null
            })

            .setTimestamp();

        await canal.send({
          embeds: [embed]
        });

      }

      // =====================
      // 🔇 TIMEOUT
      // =====================

      if (
        !oldMember.communicationDisabledUntil &&
        newMember.communicationDisabledUntil
      ) {

        const embed =
          new EmbedBuilder()

            .setColor("#ED4245")

            .setAuthor({
              name:
                "🔇 Timeout Aplicado",
              iconURL:
                newMember.user.displayAvatarURL({
                  dynamic: true
                })
            })

            .addFields(

              {
                name: "👤 Usuario",
                value: `${newMember}`,
                inline: true
              },

              {
                name: "🕒 Finaliza",
                value:
                  `<t:${Math.floor(
                    new Date(
                      newMember.communicationDisabledUntil
                    ).getTime() / 1000
                  )}:F>`
              },

              {
                name: "🛡️ Moderador",
                value:
                  executor
                    ? `${executor}`
                    : "Desconocido"
              }

            )

            .setTimestamp();

        await canal.send({
          embeds: [embed]
        });

      }

      // =====================
      // 🔊 TIMEOUT REMOVIDO
      // =====================

      if (
        oldMember.communicationDisabledUntil &&
        !newMember.communicationDisabledUntil
      ) {

        const embed =
          new EmbedBuilder()

            .setColor("#57F287")

            .setAuthor({
              name:
                "🔊 Timeout Removido",
              iconURL:
                newMember.user.displayAvatarURL({
                  dynamic: true
                })
            })

            .addFields(

              {
                name: "👤 Usuario",
                value: `${newMember}`
              },

              {
                name: "🛡️ Moderador",
                value:
                  executor
                    ? `${executor}`
                    : "Desconocido"
              }

            )

            .setTimestamp();

        await canal.send({
          embeds: [embed]
        });

      }

    } catch (error) {

      console.error(
        "❌ LOG ROLE ERROR:",
        error
      );

    }

  }

};
