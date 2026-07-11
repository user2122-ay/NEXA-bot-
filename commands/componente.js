import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} from "discord.js";
import { buildInfoContainer } from "../utils/componentsV2.js";

export const data = new SlashCommandBuilder()

  .setName("componente")
  .setDescription("Crea un mensaje personalizado (Components V2) con nombre y logo propios")

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
      .setDescription("URL del icono pequeño dentro del mensaje (thumbnail)")
  )

  .addStringOption(option =>
    option.setName("nombre")
      .setDescription("Nombre con el que se enviará el mensaje (por defecto: el del bot)")
  )

  .addStringOption(option =>
    option.setName("logo")
      .setDescription("URL del logo/avatar con el que se enviará el mensaje")
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

  const titulo = interaction.options.getString("titulo");
  const descripcion = interaction.options.getString("descripcion");
  const color = interaction.options.getString("color") || "#2b2d31";
  const imagen = interaction.options.getString("imagen");
  const icono = interaction.options.getString("icono");
  const nombre = interaction.options.getString("nombre") || interaction.client.user.username;
  const logo = interaction.options.getString("logo") || interaction.client.user.displayAvatarURL();

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

  const container = buildInfoContainer({
    color,
    title: titulo,
    description: descripcion,
    thumbnail: icono,
    image: imagen,
    footer: interaction.guild.name
  });

  // 📢 Enviar el mensaje a través del webhook con el nombre/logo personalizados
  try {
    await webhook.send({
      username: nombre,
      avatarURL: logo,
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  } catch (err) {
    console.error("⚠️ Error enviando mensaje por webhook:", err.message);
    return interaction.editReply({
      content: "❌ No se pudo enviar el mensaje."
    });
  }

  await interaction.editReply({
    content: "✅ Mensaje enviado"
  });
}
