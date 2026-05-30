import { EmbedBuilder } from "discord.js";
import Welcome from "../models/Welcome.js";
import Autorole from "../models/Autorole.js";

export default {
  name: "guildMemberAdd",

  async execute(member) {
// 🎭 AUTOROLE
try {

  const autorole = await Autorole.findOne({
    guildId: member.guild.id
  });

  if (autorole) {

    const roles = member.user.bot
      ? autorole.botRoles
      : autorole.userRoles;

    for (const roleId of roles) {

      const role =
        member.guild.roles.cache.get(roleId);

      if (!role) continue;

      await member.roles.add(role)
        .catch(() => {});

    }

  }

} catch (err) {

  console.error(
    "❌ ERROR EN AUTOROLE:",
    err
  );

}
    //welcome 
    
    try {

      // 🔍 Buscar configuración
      const data = await Welcome.findOne({
        guildId: member.guild.id
      });

      if (!data) return;

      // 📢 Canal
      const channel =
        member.guild.channels.cache.get(data.channelId);

      if (!channel) return;

      // 📝 Variables automáticas
      const texto = data.message
        .replaceAll("{user}", `${member}`)
        .replaceAll("{server}", member.guild.name)
        .replaceAll("{members}", member.guild.memberCount);

      // 🎨 EMBED
      const embed = new EmbedBuilder()

        .setColor(data.color || "#5865F2")

        .setDescription(texto)

        .setThumbnail(
          member.user.displayAvatarURL({
            dynamic: true,
            size: 4096
          })
        )

        .addFields(
          {
            name: "👤 Usuario",
            value: `\`${member.user.tag}\``,
            inline: true
          },
          {
            name: "👥 Miembros",
            value: `\`${member.guild.memberCount}\``,
            inline: true
          }
        )

        .setFooter({
          text: `${member.guild.name} • NEXA`,
          iconURL:
            member.guild.iconURL({ dynamic: true }) ||
            member.user.displayAvatarURL({ dynamic: true })
        })

        .setTimestamp();

      // 🏷️ Nombre + icono server arriba
      if (data.icon) {

        embed.setAuthor({
          name: `Bienvenido a ${member.guild.name}`,
          iconURL:
            member.guild.iconURL({ dynamic: true }) ||
            member.user.displayAvatarURL({ dynamic: true })
        });

      }

      // 🌄 Imagen grande
      if (data.image) {
        embed.setImage(data.image);
      }

      // 🚀 Enviar
      await channel.send({
        content: `${member}`,
        embeds: [embed]
      });

    } catch (error) {

      console.error(
        "❌ ERROR EN WELCOME:",
        error
      );

    }
  }
};
