import { EmbedBuilder } from "discord.js";
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

      // 🟢 Roles agregados
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
            name: "Roles agregados",
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
                  .map(role => role.toString())
                  .join("\n")
                  .slice(0, 1024)
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

      // 🔴 Roles removidos
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
            name: "Roles removidos",
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
                  .map(role => role.toString())
                  .join("\n")
                  .slice(0, 1024)
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
// 📝 Cambio de apodo
if (
  oldMember.nickname !==
  newMember.nickname
) {

  const embed = new EmbedBuilder()

    .setColor("#FAA61A")

    .setTitle("📝 Apodo actualizado")

    .addFields(

      {
        name: "👤 Usuario",
        value: `${newMember}`,
        inline: true
      },

      {
        name: "Antes",
        value:
          oldMember.nickname ||
          "Sin apodo",
        inline: false
      },

      {
        name: "Después",
        value:
          newMember.nickname ||
          "Sin apodo",
        inline: false
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
    if (
  !oldMember.communicationDisabledUntil &&
  newMember.communicationDisabledUntil
) {

  const embed = new EmbedBuilder()

    .setColor("#ED4245")

    .setTitle("🔇 Timeout aplicado")

    .addFields(

      {
        name: "👤 Usuario",
        value: `${newMember}`,
        inline: true
      },

      {
        name: "Finaliza",
        value:
          `<t:${Math.floor(
            new Date(
              newMember.communicationDisabledUntil
            ).getTime() / 1000
          )}:F>`
      }

    )

    .setTimestamp();

  await canal.send({
    embeds: [embed]
  });

    }
    if (
  oldMember.communicationDisabledUntil &&
  !newMember.communicationDisabledUntil
) {

  const embed = new EmbedBuilder()

    .setColor("#57F287")

    .setTitle("🔊 Timeout removido")

    .addFields({

      name: "👤 Usuario",

      value: `${newMember}`

    })

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
