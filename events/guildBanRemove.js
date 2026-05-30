import { EmbedBuilder } from "discord.js";
import Logs from "../models/Logs.js";

export default {

  name: "guildBanRemove",

  async execute(ban) {

    try {

      const data = await Logs.findOne({
        guildId: ban.guild.id
      });

      if (!data) return;

      const canal =
        ban.guild.channels.cache.get(
          data.channelId
        );

      if (!canal) return;

      const embed = new EmbedBuilder()

        .setColor("#57F287")

        .setTitle("🔓 Usuario desbaneado")

        .addFields(

          {
            name: "👤 Usuario",
            value: `${ban.user.tag}`,
            inline: true
          },

          {
            name: "🆔 ID",
            value: `\`${ban.user.id}\``,
            inline: true
          }

        )

        .setThumbnail(
          ban.user.displayAvatarURL({
            dynamic: true
          })
        )

        .setFooter({
          text: ban.guild.name,
          iconURL:
            ban.guild.iconURL({
              dynamic: true
            }) || null
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
