import { EmbedBuilder } from "discord.js";
import Logs from "../models/Logs.js";

export default {

  name: "channelCreate",

  async execute(channel) {

    try {

      if (!channel.guild) return;

      const data = await Logs.findOne({
        guildId: channel.guild.id
      });

      if (!data) return;

      const logChannel =
        channel.guild.channels.cache.get(
          data.channelId
        );

      if (!logChannel) return;

      const embed = new EmbedBuilder()

        .setColor("#57F287")

        .setTitle("📁 Canal creado")

        .addFields(

          {
            name: "📢 Canal",
            value: `${channel}`,
            inline: true
          },

          {
            name: "🆔 ID",
            value: `\`${channel.id}\``,
            inline: true
          },

          {
            name: "📂 Tipo",
            value: `${channel.type}`,
            inline: true
          }

        )

        .setFooter({
          text: channel.guild.name,
          iconURL:
            channel.guild.iconURL({
              dynamic: true
            }) || null
        })

        .setTimestamp();

      await logChannel.send({
        embeds: [embed]
      });

    } catch (error) {

      console.error(
        "❌ CHANNEL CREATE LOG ERROR:",
        error
      );

    }

  }

};
