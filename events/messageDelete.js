import { EmbedBuilder } from "discord.js";
import Logs from "../models/Logs.js";

export default {

  name: "messageDelete",

  async execute(message) {

    try {

      // Ignorar DMs
      if (!message.guild) return;

      // Ignorar bots
      if (message.author?.bot) return;

      // Buscar configuración
      const data = await Logs.findOne({
        guildId: message.guild.id
      });

      if (!data) return;

      // Canal logs
      const canal =
        message.guild.channels.cache.get(
          data.channelId
        );

      if (!canal) return;

      const embed = new EmbedBuilder()

        .setColor("#ED4245")

        .setAuthor({
          name: "Mensaje eliminado",
          iconURL:
            message.author.displayAvatarURL({
              dynamic: true
            })
        })

        .addFields(

          {
            name: "👤 Usuario",
            value: `${message.author}`,
            inline: true
          },

          {
            name: "📍 Canal",
            value: `${message.channel}`,
            inline: true
          },

          {
            name: "🆔 Usuario ID",
            value: `\`${message.author.id}\``,
            inline: false
          }

        )

        .setFooter({
          text: message.guild.name,
          iconURL:
            message.guild.iconURL({
              dynamic: true
            }) || null
        })

        .setTimestamp();

      // Contenido
      if (message.content) {

        embed.addFields({
          name: "💬 Contenido",
          value:
            message.content.length > 1024
              ? message.content.slice(0, 1020) + "..."
              : message.content
        });

      }

      await canal.send({
        embeds: [embed]
      });

    } catch (error) {

      console.error(
        "❌ LOG DELETE ERROR:",
        error
      );

    }

  }

};
