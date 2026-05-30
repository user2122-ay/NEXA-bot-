import { EmbedBuilder } from "discord.js";
import Logs from "../models/Logs.js";

export default {

  name: "guildBanAdd",

  async execute(ban) {

    try {

      const data = await Logs.findOne({
        guildId: ban.guild.id
      });

      if (!data) return;

      const logChannel =
        ban.guild.channels.cache.get(
          data.channelId
        );

      if (!logChannel) return;

      const embed = new EmbedBuilder()

        .setColor("#ED4245")

        .setTitle("🔨 Usuario baneado")

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
