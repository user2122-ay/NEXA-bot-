import { MessageFlags } from "discord.js";
import Goodbye from "../models/Goodbye.js";
import { buildInfoContainer } from "../utils/componentsV2.js";

export default {

  name: "guildMemberRemove",

  async execute(member) {

    try {

      const data = await Goodbye.findOne({
        guildId: member.guild.id
      });

      if (!data) return;

      const channel = member.guild.channels.cache.get(data.channelId);

      if (!channel) return;

      const texto = data.message
        .replaceAll("{user}", member.user.tag)
        .replaceAll("{server}", member.guild.name)
        .replaceAll("{members}", member.guild.memberCount);

      const container = buildInfoContainer({
        color: data.color || "#ED4245",
        title: data.icon ? `Salida de ${member.guild.name}` : null,
        description: texto,
        thumbnail: member.user.displayAvatarURL({ dynamic: true, size: 4096 }),
        image: data.image,
        footer: member.guild.name
      });

      await channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });

    } catch (err) {
      console.error("❌ GOODBYE ERROR:", err);
    }

  }

};
