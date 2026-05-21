import {
  SlashCommandBuilder,
  EmbedBuilder
} from "discord.js";

export const data = new SlashCommandBuilder()

  .setName("avatar")
  .setDescription("Muestra el avatar de un usuario")

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

  // 🖼️ Avatar HD
  const avatarURL = user.displayAvatarURL({
    dynamic: true,
    size: 4096
  });

  // 🎨 EMBED PRO
  const embed = new EmbedBuilder()

    .setColor("#5865F2")

    .setAuthor({
      name: `Avatar de ${user.tag}`,
      iconURL: avatarURL
    })

    .setImage(avatarURL)

    .setDescription(
      `### 🖼️ Avatar Global\n` +
      `> Usuario: ${user}\n` +
      `> ID: \`${user.id}\`\n\n` +
      `[🔗 Descargar Avatar](${avatarURL})`
    )

    .setFooter({
      text: interaction.guild.name,
      iconURL:
        interaction.guild.iconURL({
          dynamic: true
        }) || avatarURL
    })

    .setTimestamp();

  // 🚀 Enviar
  await interaction.reply({
    embeds: [embed]
  });

}
