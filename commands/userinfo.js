import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("userinfo")
  .setDescription("Muestra información de un usuario")
  .addUserOption(option =>
    option
      .setName("usuario")
      .setDescription("Usuario a consultar")
      .setRequired(false)
  );

export async function execute(interaction) {
  const user = interaction.options.getUser("usuario") || interaction.user;
  const member = interaction.guild.members.cache.get(user.id);

  const createdAt = `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`;
  const joinedAt = member
    ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`
    : "No disponible";

  const roles = member
    ? member.roles.cache
        .filter(r => r.id !== interaction.guild.id)
        .map(r => r.toString())
        .join(", ") || "Sin roles"
    : "No disponible";

  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setAuthor({
      name: user.tag,
      iconURL: user.displayAvatarURL({ dynamic: true })
    })
    .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
    .addFields(
      { name: "🆔 ID", value: user.id, inline: true },
      { name: "🤖 Bot", value: user.bot ? "Sí" : "No", inline: true },
      { name: "📅 Cuenta creada", value: createdAt },
      { name: "📥 Entró al servidor", value: joinedAt },
      { name: "🎭 Roles", value: roles }
    )
    .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
