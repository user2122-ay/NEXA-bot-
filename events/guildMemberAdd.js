import { MessageFlags, TextDisplayBuilder } from "discord.js";
import Welcome from "../models/Welcome.js";
import Autorole from "../models/Autorole.js";
import { buildInfoContainer } from "../utils/componentsV2.js";

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

          await member.roles.add(role).catch(() => {});

        }

      }

    } catch (err) {
      console.error("❌ ERROR EN AUTOROLE:", err);
    }

    // 👋 WELCOME (Components V2)
    try {

      const data = await Welcome.findOne({
        guildId: member.guild.id
      });

      if (!data) return;

      const channel =
        member.guild.channels.cache.get(data.channelId);

      if (!channel) return;

      // 📝 Variables automáticas
      const texto = data.message
        .replaceAll("{user}", `${member}`)
        .replaceAll("{server}", member.guild.name)
        .replaceAll("{members}", member.guild.memberCount);

      const descripcion =
        `${texto}\n\n` +
        `👤 Usuario: \`${member.user.tag}\`\n` +
        `👥 Miembros: \`${member.guild.memberCount}\``;

      const container = buildInfoContainer({
        color: data.color || "#5865F2",
        title: data.icon ? `Bienvenido a ${member.guild.name}` : null,
        description: descripcion,
        thumbnail: member.user.displayAvatarURL({ dynamic: true, size: 4096 }),
        image: data.image,
        footer: `${member.guild.name} • NEXA`
      });

      // 📣 El ping va como un bloque de texto aparte (no se puede usar "content" en V2)
      const ping = new TextDisplayBuilder().setContent(`${member}`);

      await channel.send({
        components: [ping, container],
        flags: MessageFlags.IsComponentsV2
      });

    } catch (error) {
      console.error("❌ ERROR EN WELCOME:", error);
    }
  }
};
