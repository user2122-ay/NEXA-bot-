import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} from "discord.js";
import { buildInfoContainer } from "../utils/componentsV2.js";

// 🎨 Paleta de colores predefinida (nombre visible -> valor HEX)
const PALETA_COLORES = [
  { name: "Blurple (Discord)", value: "#5865F2" },
  { name: "Verde", value: "#57F287" },
  { name: "Rojo", value: "#ED4245" },
  { name: "Amarillo", value: "#FEE75C" },
  { name: "Rosado / Fucsia", value: "#EB459E" },
  { name: "Naranja", value: "#E67E22" },
  { name: "Morado", value: "#9B59B6" },
  { name: "Turquesa", value: "#1ABC9C" },
  { name: "Celeste", value: "#3498DB" },
  { name: "Dorado", value: "#F1C40F" },
  { name: "Verde oscuro", value: "#1F8B4C" },
  { name: "Rojo oscuro", value: "#992D22" },
  { name: "Azul marino", value: "#2C3E50" },
  { name: "Gris", value: "#99AAB5" },
  { name: "Blanco", value: "#FFFFFF" },
  { name: "Negro", value: "#23272A" }
];

export const data = new SlashCommandBuilder()

  .setName("componente")
  .setDescription("Crea un mensaje personalizado (Components V2) con nombre y logo propios")

  // ⚠️ Los campos requeridos van primero (Discord lo exige)
  .addStringOption(option =>
    option.setName("nombre")
      .setDescription("Nombre con el que se enviará el mensaje")
      .setRequired(true)
  )

  .addStringOption(option =>
    option.setName("logo")
      .setDescription("URL del logo/avatar con el que se enviará el mensaje")
      .setRequired(true)
  )

  .addAttachmentOption(option =>
    option.setName("imagen_archivo")
      .setDescription("Sube la imagen grande desde tu galería")
  )

  .addAttachmentOption(option =>
    option.setName("icono_archivo")
      .setDescription("Sube el icono pequeño desde tu galería")
  )

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
      .setDescription("Elige un color de la paleta")
      .addChoices(...PALETA_COLORES)
  )

  .setDefaultMemberPermissions(
    PermissionFlagsBits.Administrator
  );

export async function execute(interaction) {

  // 🔒 Verificar permisos del usuario
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "❌ No tienes permisos",
      flags: 64
    });
  }

  const nombre = interaction.options.getString("nombre");
  const logo = interaction.options.getString("logo");
  const titulo = interaction.options.getString("titulo");
  const descripcion = interaction.options.getString("descripcion");
  const color = interaction.options.getString("color") || "#2b2d31";

  const imagenArchivo = interaction.options.getAttachment("imagen_archivo");
  const iconoArchivo = interaction.options.getAttachment("icono_archivo");

  // 🔍 Validar que los archivos subidos sean realmente imágenes
  if (imagenArchivo && imagenArchivo.contentType && !imagenArchivo.contentType.startsWith("image/")) {
    return interaction.reply({
      content: "❌ El archivo de 'imagen_archivo' no es una imagen válida.",
      flags: 64
    });
  }

  if (iconoArchivo && iconoArchivo.contentType && !iconoArchivo.contentType.startsWith("image/")) {
    return interaction.reply({
      content: "❌ El archivo de 'icono_archivo' no es una imagen válida.",
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

  // 🔒 Verificar que el bot tenga permiso de gestionar webhooks en este canal
  const botPerms = interaction.channel.permissionsFor(interaction.guild.members.me);
  if (!botPerms?.has(PermissionFlagsBits.ManageWebhooks)) {
    return interaction.reply({
      content: "❌ Me falta el permiso **Gestionar webhooks** en este canal para poder enviar el mensaje personalizado.",
      flags: 64
    });
  }

  await interaction.deferReply({ flags: 64 });

  // 🪝 Buscar un webhook propio del bot en este canal, o crear uno nuevo
  let webhook;
  try {
    const webhooks = await interaction.channel.fetchWebhooks();
    webhook = webhooks.find(wh => wh.owner?.id === interaction.client.user.id);

    if (!webhook) {
      webhook = await interaction.channel.createWebhook({
        name: "Nexa Componente",
        avatar: interaction.client.user.displayAvatarURL()
      });
    }
  } catch (err) {
    console.error("⚠️ Error creando/obteniendo webhook:", err.message);
    return interaction.editReply({
      content: "❌ No se pudo crear u obtener el webhook en este canal."
    });
  }

  // 📎 Re-subir los archivos como parte del mensaje nuevo, en vez de usar
  // el link temporal del adjunto de la interacción (ese link expira/no sirve
  // fuera del contexto de la interacción original).
  const files = [];
  let imagenRef = null;
  let iconoRef = null;

  if (imagenArchivo) {
    files.push({ attachment: imagenArchivo.url, name: imagenArchivo.name });
    imagenRef = `attachment://${imagenArchivo.name}`;
  }

  if (iconoArchivo) {
    // Evitar choque de nombres si suben un archivo con el mismo nombre para ambos
    const mismoNombre = imagenArchivo && imagenArchivo.name === iconoArchivo.name;
    const iconoName = mismoNombre ? `icono-${iconoArchivo.name}` : iconoArchivo.name;

    files.push({ attachment: iconoArchivo.url, name: iconoName });
    iconoRef = `attachment://${iconoName}`;
  }

  const container = buildInfoContainer({
    color,
    title: titulo,
    description: descripcion,
    thumbnail: iconoRef,
    image: imagenRef,
    footer: interaction.guild.name
  });

  // 📢 Enviar el mensaje a través del webhook con el nombre/logo personalizados
  try {
    await webhook.send({
      username: nombre,
      avatarURL: logo,
      components: [container],
      files,
      flags: MessageFlags.IsComponentsV2
    });
  } catch (err) {
    console.error("⚠️ Error enviando mensaje por webhook:", err.message);
    return interaction.editReply({
      content: `❌ No se pudo enviar el mensaje.\n\nError: ${err.message}`
    });
  }

  await interaction.editReply({
    content: "✅ Mensaje enviado"
  });
}
