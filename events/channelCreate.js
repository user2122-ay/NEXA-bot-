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
  if (!data.logs.channels) return;

  const logChannel =
    channel.guild.channels.cache.get(
      data.channelId
    );

  if (!logChannel) return;

  // 🔍 Buscar responsable
  const logs =
    await channel.guild.fetchAuditLogs({
      type: 10,
      limit: 1
    });

  const entry = logs.entries.first();

  const executor =
    entry?.executor || null;

  const embed = new EmbedBuilder()

    .setColor("#57F287")

    .setAuthor({
      name: "📁 Canal Creado",
      iconURL:
        channel.guild.iconURL({
          dynamic: true
        }) || undefined
    })

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
      },

      {
        name: "🛡️ Creado por",
        value:
          executor
            ? `${executor}`
            : "Desconocido",
        inline: false
      }

    )

    .setFooter({
      text: channel.guild.name,
      iconURL:
        channel.guild.iconURL({
          dynamic: true
        }) || undefined
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
