import { EmbedBuilder } from "discord.js";
import Welcome from "../models/Welcome.js";

export default {
  name: "guildMemberAdd",

  async execute(member) {

    try {

      // 🔍 Buscar configuración
      const data = await Welcome.findOne({
        guildId: member.guild.id
      });

      if (!data) return;

      // 📢 Canal
      const channel = member.guild.channels.cache.get(data.channelId);

      if (!channel) return;

      // 📝 Reemplazos automáticos
      let texto = data.message
        .replace("{user}", `${member}`)
        .replace("{server}", member.guild.name);

      // 🎨 EMBED
      const embed = new EmbedBuilder()
        .setColor(data.color || "#5865F2")
        .setDescription(texto)
        .setThumbnail(
          member.user.displayAvatarURL({ dynamic: true })
        )
        .addFields(
          {
            name: "👥 Miembros",
            value: `${member.guild.memberCount}`,
            inline: true
          },
          {
            name: "🆔 Usuario",
            value: member.user.tag,
            inline: true
          }
        )
        .setFooter({
          text: "NEXA • Sistema de Bienvenida"
        })
        .setTimestamp();

      // 🏷️ Icono del servidor
      if (data.icon) {
        embed.setAuthor({
          name: member.guild.name,
          iconURL: member.guild.iconURL({ dynamic: true })
        });
      }

      // 🌄 Imagen grande
      if (data.image) {
        embed.setImage(data.image);
      }

      // 🚀 Enviar mensaje
      await channel.send({
        content: `${member}`,
        embeds: [embed]
      });

    } catch (error) {
      console.error("WELCOME ERROR:", error);
    }
  }
};
