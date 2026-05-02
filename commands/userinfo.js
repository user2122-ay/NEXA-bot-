import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("userinfo")
  .setDescription("Muestra información de un usuario")
  .addUserOption(option =>
    option.setName("usuario")
      .setDescription("Usuario a consultar")
      .setRequired(false)
  );

export async function execute(interaction) {
  const user = interaction.options.getUser("usuario") || interaction.user;
  const member = interaction.guild.members.cache.get(user.id);

  const embed = new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle(`👤 Información de ${user.username}`)
    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: "🆔 ID", value: user.id, inline: true },
      { name: "📅 Cuenta creada", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
      { name: "🤖 Bot", value: user.bot ? "Sí" : "No", inline: true }
    )
    .setFooter({ text: "NEXA • DEVWORKS STUDIOS" })
    .setTimestamp();

  if (member) {
    embed.addFields(
      { name: "📥 Se unió", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
      { name: "🎭 Roles", value: member.roles.cache
          .filter(r => r.id !== interaction.guild.id)
          .map(r => `<@&${r.id}>`)
          .join(", ") || "Ninguno"
      }
    );
  }

  await interaction.reply({ embeds: [embed] });
}
