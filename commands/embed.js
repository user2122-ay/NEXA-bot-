import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} from "discord.js";
import { buildInfoContainer } from "../utils/componentsV2.js";

export const data = new SlashCommandBuilder()

  .setName("embed")
  .setDescription("Crea un mensaje personalizado con Components V2")

  .addStringOption(option =>
    option.setName("titulo")
      .setDescription("Título del mensaje")
  )

  .addStringOption(option =>
    option.setName("descripcion")
      .setDescription("Contenido del mensaje")
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
      .setDescription("URL del icono pequeño (thumbnail)")
  )

  .setDefaultMemberPermissions(
    PermissionFlagsBits.Administrator
  );

export async function execute(interaction) {

  const titulo = interaction.options.getString("titulo");
  const descripcion = interaction.options.getString("descripcion");
  const color = interaction.options.getString("color") || "#2b2d31";
  const imagen = interaction.options.getString("imagen");
  const icono = interaction.options.getString("icono");

  // 🔒 Verificar permisos
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "❌ No tienes permisos",
      flags: 64
    });
  }

  // ⚠️ Debe haber al menos título o descripción, si no el Container queda vacío
  if (!titulo && !descripcion) {
    return interaction.reply({
      content: "❌ Debes escribir al menos un título o una descripción.",
      flags: 64
    });
  }

  const container = buildInfoContainer({
    color,
    title: titulo,
    description: descripcion,
    thumbnail: icono,
    image: imagen,
    footer: interaction.guild.name
  });

  // 🚀 Confirmación (esto sí puede ser un mensaje normal, es efímero)
  await interaction.reply({
    content: "✅ Mensaje enviado",
    flags: 64
  });

  // 📢 Enviar el mensaje con Components V2
  // Importante: NO se puede mezclar con "content" ni "embeds" en el mismo mensaje
  await interaction.channel.send({
    components: [container],
    flags: MessageFlags.IsComponentsV2
  });

}
