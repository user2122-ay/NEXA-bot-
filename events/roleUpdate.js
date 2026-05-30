import { EmbedBuilder } from "discord.js";
import Logs from "../models/Logs.js";

export default {

  name: "roleUpdate",

  async execute(oldRole, newRole) {

    try {

      const data = await Logs.findOne({
        guildId: newRole.guild.id
      });

      if (!data) return;

      const logChannel =
        newRole.guild.channels.cache.get(
          data.channelId
        );

      if (!logChannel) return;

      const cambios = [];

      if (oldRole.name !== newRole.name) {

        cambios.push(
          `📛 Nombre:\n${oldRole.name} ➜ ${newRole.name}`
        );

      }

      if (
        oldRole.hexColor !==
        newRole.hexColor
      ) {

        cambios.push(
          `🎨 Color:\n${oldRole.hexColor} ➜ ${newRole.hexColor}`
        );

      }

      if (cambios.length <= 0) return;

      const embed = new EmbedBuilder()

        .setColor("#FAA61A")

        .setTitle("🎭 Rol actualizado")

        .addFields(

          {
            name: "Rol",
            value: `${newRole}`,
            inline: false
          },

          {
            name: "Cambios",
            value: cambios.join("\n\n")
          }

        )

        .setFooter({
          text: newRole.guild.name,
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
