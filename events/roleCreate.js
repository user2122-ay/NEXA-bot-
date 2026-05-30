import { EmbedBuilder } from "discord.js";
import Logs from "../models/Logs.js";

export default {

  name: "roleCreate",

  async execute(role) {

    try {

      const data = await Logs.findOne({
        guildId: role.guild.id
      });

      if (!data) return;

      const logChannel =
        role.guild.channels.cache.get(
          data.channelId
        );

      if (!logChannel) return;

      const embed = new EmbedBuilder()

        .setColor("#57F287")

        .setTitle("🎭 Rol creado")

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
            value: role.hexColor || "Sin color",
            inline: true
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
