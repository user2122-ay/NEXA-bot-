import {
  SlashCommandBuilder,
  EmbedBuilder
} from "discord.js";

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

  // 👤 Usuario
  const user =
    interaction.options.getUser("usuario") ||
    interaction.user;

  // 🧠 Miembro
  const member =
    interaction.guild.members.cache.get(user.id);

  // 🎭 Roles
  let roles = "Ninguno";

  if (member) {

    const roleList = member.roles.cache

      .filter(r => r.id !== interaction.guild.id)

      .sort((a, b) => b.position - a.position)

      .map(r => r.toString());

    roles =
      roleList.length > 0
        ? roleList.join(" ")
        : "Ninguno";

    // ⚠️ evitar límite Discord
    if (roles.length > 1024) {
      roles =
        `${roleList.slice(0, 15).join(" ")}\n` +
        `\nY ${roleList.length - 15} roles más...`;
    }

  }

  // 🎨 EMBED PRO
  const embed = new EmbedBuilder()

    .setColor("#5865F2")

    .setAuthor({
      name: `${user.tag}`,
      iconURL:
        user.displayAvatarURL({
          dynamic: true
        })
    })

    .setThumbnail(
      user.displayAvatarURL({
        dynamic: true,
        size: 4096
      })
    )

    .setDescription(
      `### 👤 Información de Usuario\n` +
      `> Información detallada del miembro`
    )

    .addFields(

      {
        name: "🆔 ID",
        value: `\`${user.id}\``,
        inline: true
      },

      {
        name: "🤖 Bot",
        value: user.bot ? "Sí" : "No",
        inline: true
      },

      {
        name: "📅 Cuenta creada",
        value:
          `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
        inline: false
      }

    );

  // 📥 Datos del servidor
  if (member) {

    embed.addFields(

      {
        name: "📥 Entró al servidor",
        value:
          `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
        inline: false
      },

      {
        name: `🎭 Roles (${member.roles.cache.size - 1})`,
        value: roles,
        inline: false
      }

    );

  }

  // 🏷️ Footer PRO
  embed

    .setFooter({

      text: interaction.guild.name,

      iconURL:
        interaction.guild.iconURL({
          dynamic: true
        }) ||
        user.displayAvatarURL({
          dynamic: true
        })

    })

    .setTimestamp();

  // 🚀 Respuesta
  await interaction.reply({
    embeds: [embed]
  });

}
