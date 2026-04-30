import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("embed")
  .setDescription("Crea un embed personalizado")
  .addStringOption(option =>
    option.setName("titulo")
      .setDescription("Título del embed")
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName("descripcion")
      .setDescription("Contenido del embed")
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName("color")
      .setDescription("Color en HEX (ej: #5865F2)")
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName("imagen")
      .setDescription("URL de la imagen")
      .setRequired(false)
  )
  // 🔒 Solo admins
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const titulo = interaction.options.getString("titulo");
  const descripcion = interaction.options.getString("descripcion");
  const color = interaction.options.getString("color") || "#2b2d31";
  const imagen = interaction.options.getString("imagen");

  // 🔒 Seguridad extra
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "❌ No tienes permisos para usar este comando",
      ephemeral: true
    });
  }

  const embed = new EmbedBuilder()
    .setColor(color)
    .setFooter({
      text: "NEXA • DEVWORKS STUDIOS"
    })
    .setTimestamp();

  if (titulo) embed.setTitle(titulo);
  if (descripcion) embed.setDescription(descripcion);
  if (imagen) embed.setImage(imagen);

  await interaction.reply({
    content: "✅ Embed enviado",
    ephemeral: true
  });

  await interaction.channel.send({ embeds: [embed] });
}
