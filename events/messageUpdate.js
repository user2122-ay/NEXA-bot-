import { EmbedBuilder } from "discord.js";
import Logs from "../models/Logs.js";

export default {

  name: "messageUpdate",

  async execute(oldMessage, newMessage) {

    try {

      if (!newMessage.guild) return;

      if (newMessage.author?.bot) return;

      // Ignorar si no cambió el contenido
      if (
        oldMessage.content ===
        newMessage.content
      ) return;

      const data = await Logs.findOne({
        guildId: newMessage.guild.id
      });

      if (!data) return;

      const canal =
        newMessage.guild.channels.cache.get(
          data.channelId
        );

      if (!canal) return;

      const embed = new EmbedBuilder()

        .setColor("#FAA61A")

        .setAuthor({
          name: "Mensaje editado",
          iconURL:
            newMessage.author.displayAvatarURL({
              dynamic: true
            })
        })

        .addFields(

          {
            name: "👤 Usuario",
            value: `${newMessage.author}`,
            inline: true
          },

          {
            name: "📍 Canal",
            value: `${newMessage.channel}`,
            inline: true
          },

          {
            name: "📝 Antes",
            value:
              oldMessage.content
                ? oldMessage.content.slice(0, 1024)
                : "Sin contenido"
          },

          {
            name: "✏️ Después",
            value:
              newMessage.content
                ? newMessage.content.slice(0, 1024)
                : "Sin contenido"
          }

        )

        .setFooter({
          text: newMessage.guild.name,
          iconURL:
            newMessage.guild.iconURL({
              dynamic: true
            }) || null
        })

        .setTimestamp();

      await canal.send({
        embeds: [embed]
      });

    } catch (error) {

      console.error(
        "❌ LOG UPDATE ERROR:",
        error
      );

    }

  }

};
