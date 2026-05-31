import { EmbedBuilder } from "discord.js";
import Goodbye from "../models/Goodbye.js";

export default {

  name: "guildMemberRemove",

  async execute(member) {

    try {

      const data = await Goodbye.findOne({
        guildId: member.guild.id
      });

      if (!data) return;

if (!data.logs.members) return;

      const channel =
        member.guild.channels.cache.get(
          data.channelId
        );

      if (!channel) return;

      const texto = data.message

        .replaceAll("{user}", member.user.tag)

        .replaceAll(
          "{server}",
          member.guild.name
        )

        .replaceAll(
          "{members}",
          member.guild.memberCount
        );

      const embed = new EmbedBuilder()

        .setColor(
          data.color || "#ED4245"
        )

        .setDescription(texto)

        .setThumbnail(
          member.user.displayAvatarURL({
            dynamic: true,
            size: 4096
          })
        )

        .setFooter({
          text: member.guild.name,
          iconURL:
            member.guild.iconURL({
              dynamic: true
            }) || null
        })

        .setTimestamp();

      if (data.icon) {

        embed.setAuthor({
          name:
            `Salida de ${member.guild.name}`,
          iconURL:
            member.guild.iconURL({
              dynamic: true
            }) || null
        });

      }

      if (data.image) {
        embed.setImage(data.image);
      }

      await channel.send({
        embeds: [embed]
      });

    } catch (err) {

      console.error(
        "❌ GOODBYE ERROR:",
        err
      );

    }

  }

};
