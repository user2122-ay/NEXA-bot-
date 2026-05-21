import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} from "discord.js";

export const data = new SlashCommandBuilder()

  .setName("embed")
  .setDescription("Crea un embed personalizado")

  .addStringOption(option =>
    option.setName("titulo")
      .setDescription("Título del embed")
  )

  .addStringOption(option =>
    option.setName("descripcion")
      .setDescription("Contenido del embed")
  )

  .addStringOption(option =>
    option.setName("color")
      .setDescription("Color HEX (#5865F2)")
  )

  .addStringOption(option =>
    option.setName("imagen")
      .setDescription("URL de la imagen grande")
  )

  .addStringOption(option =>
    option.setName("icono")
      .setDescription("URL del icono pequeño")
  )

  .setDefaultMemberPermissions(
    PermissionFlagsBits.Administrator
  );

export async function execute(interaction) {

  const titulo =
    interaction.options.getString("titulo");

  const descripcion =
    interaction.options.getString("descripcion");

  const color =
    interaction.options.getString("color") ||
    "#2b2d31";

  const imagen =
    interaction.options.getString("imagen");

  const icono =
    interaction.options.getString("icono");

  // 🔒 Verificar permisos
  if (
    !interaction.member.permissions.has(
      PermissionFlagsBits.Administrator
    )
  ) {

    return interaction.reply({
      content: "❌ No tienes permisos",
      flags: 64
    });

  }

  // 🎨 EMBED
  const embed = new EmbedBuilder()

    .setColor(color)

    .setFooter({
      text: interaction.guild.name,
      iconURL:
        interaction.guild.iconURL({
          dynamic: true
        }) || null
    })

    .setTimestamp();

  // 🏷️ Título
  if (titulo) {
    embed.setTitle(titulo);
  }

  // 📝 Descripción
  if (descripcion) {
    embed.setDescription(descripcion);
  }

  // 🌄 Imagen grande
  if (imagen) {
    embed.setImage(imagen);
  }

  // 🖼️ Icono pequeño
  if (icono) {
    embed.setThumbnail(icono);
  }

  // 🚀 Confirmación
  await interaction.reply({
    content: "✅ Embed enviado",
    flags: 64
  });

  // 📢 Enviar embed
  await interaction.channel.send({
    embeds: [embed]
  });

}
