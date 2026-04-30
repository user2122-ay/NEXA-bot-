import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("serverinfo")
  .setDescription("Muestra información del servidor");

export async function execute(interaction) {
  const { guild } = interaction;

  const owner = await guild.fetchOwner();

  const createdAt = `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`;
  const memberCount = guild.memberCount;

  const roles = guild.roles.cache
    .filter(r => r.id !== guild.id)
    .sort((a, b) => b.position - a.position)
    .map(r => r.toString())
    .join(", ") || "Sin roles";

  const channels = guild.channels.cache;
  const textChannels = channels.filter(c => c.type === 0).size;
  const voiceChannels = channels.filter(c => c.type === 2).size;

  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle(`📊 ${guild.name}`)
    .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
    .addFields(
      { name: "👑 Dueño", value: `<@${owner.id}>`, inline: true },
      { name: "🆔 ID", value: guild.id, inline: true },
      { name: "📅 Creado el", value: createdAt, inline: false },
      { name: "👥 Miembros", value: `${memberCount}`, inline: true },
      { name: "💬 Canales de texto", value: `${textChannels}`, inline: true },
      { name: "🔊 Canales de voz", value: `${voiceChannels}`, inline: true },
      { name: "🎭 Roles", value: roles.length > 1024 ? "Demasiados roles para mostrar" : roles }
    )
    .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
