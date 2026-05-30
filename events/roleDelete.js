import { EmbedBuilder } from "discord.js";
import Logs from "../models/Logs.js";

export default {

  name: "roleDelete",

  async execute(role) {

    try {

      const data = await Logs.findOne({
        guildId: role.guild.id
      });

      if (!data) return;

      const canal =
        role.guild.channels.cache.get(
          data.channelId
        );

      if (!canal) return;

      const embed = new EmbedBuilder()

        .setColor("#ED4245")

        .setTitle("🗑️ Rol eliminado")

        .addFields(

          {
            name: "🏷️ Nombre",
            value: role.name,
            inline: true
          },

          {
            name: "🆔 ID",
            value: `\`${role.id}\``,
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

      await canal.send({
        embeds: [embed]
      });

    } catch (error) {

      console.error(
        "❌ ROLE DELETE LOG ERROR:",
        error
      );

    }

  }

};
