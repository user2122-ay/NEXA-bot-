import { EmbedBuilder } from "discord.js";
import Logs from "../models/Logs.js";

export default {

  name: "channelUpdate",

  async execute(oldChannel, newChannel) {

    try {

      if (
        oldChannel.name ===
        newChannel.name
      ) return;

      const data = await Logs.findOne({
        guildId: newChannel.guild.id
      });

      if (!data) return;

      const logChannel =
        newChannel.guild.channels.cache.get(
          data.channelId
        );

      if (!logChannel) return;

      const embed = new EmbedBuilder()

        .setColor("#FAA61A")

        .setTitle("📝 Canal actualizado")

        .addFields(

          {
            name: "📢 Canal",
            value: `${newChannel}`,
            inline: true
          },

          {
            name: "📛 Nombre anterior",
            value: oldChannel.name,
            inline: false
          },

          {
            name: "✨ Nombre nuevo",
            value: newChannel.name,
            inline: false
          }

        )

        .setFooter({
          text: newChannel.guild.name,
          iconURL:
            newChannel.guild.iconURL({
              dynamic: true
            }) || null
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
