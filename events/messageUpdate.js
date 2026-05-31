import { EmbedBuilder } from "discord.js";
import Logs from "../models/Logs.js";

export default {

  name: "messageUpdate",

  async execute(oldMessage, newMessage) {

    try {

      if (!newMessage.guild) return;

      if (newMessage.author?.bot) return;

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

      const before =
        oldMessage.content ||
        "Sin contenido";

      const after =
        newMessage.content ||
        "Sin contenido";

      const embed = new EmbedBuilder()

        .setColor("#FEE75C")

        .setAuthor({

          name: "📝 Mensaje Editado",

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
            name: "🆔 ID",
            value: `\`${newMessage.author.id}\``,
            inline: true
          }

        )

        .setDescription(

          `### 📝 Antes\n` +

          "```" +

          before.slice(0, 1500) +

          "```\n\n" +

          `### ✏️ Después\n` +

          "```" +

          after.slice(0, 1500) +

          "```"

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
