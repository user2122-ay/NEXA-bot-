import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} from "discord.js";

import Goodbye from "../models/Goodbye.js";
import { buildInfoContainer } from "../utils/componentsV2.js";

export const data = new SlashCommandBuilder()

  .setName("goodbye")
  .setDescription("Sistema de despedida")

  .addSubcommand(sub =>
    sub.setName("set")
      .setDescription("Configurar despedida")

      .addChannelOption(option =>
        option.setName("canal")
          .setDescription("Canal de despedida")
          .setRequired(true)
      )

      .addStringOption(option =>
        option.setName("mensaje")
          .setDescription("Mensaje personalizado")
          .setRequired(true)
      )

      .addStringOption(option =>
        option.setName("color")
          .setDescription("Color HEX (#ED4245)")
      )

      .addStringOption(option =>
        option.setName("imagen")
          .setDescription("URL de imagen grande")
      )

      .addBooleanOption(option =>
        option.setName("icono")
          .setDescription("¿Mostrar icono del servidor?")
      )
  )

  .addSubcommand(sub =>
    sub.setName("test")
      .setDescription("Probar despedida")
  )

  .addSubcommand(sub =>
    sub.setName("remove")
      .setDescription("Eliminar despedida")
  )

  .setDefaultMemberPermissions(
    PermissionFlagsBits.ManageGuild
  );

export async function execute(interaction) {

  const sub = interaction.options.getSubcommand();

  // ⚙️ SET
  if (sub === "set") {

    const canal = interaction.options.getChannel("canal");
    const mensaje = interaction.options.getString("mensaje");
    const color = interaction.options.getString("color") || "#ED4245";
    const imagen = interaction.options.getString("imagen");
    const icono = interaction.options.getBoolean("icono") ?? true;

    await Goodbye.findOneAndUpdate(
      { guildId: interaction.guild.id },
      {
        guildId: interaction.guild.id,
        channelId: canal.id,
        message: mensaje,
        color,
        image: imagen,
        icon: icono
      },
      { upsert: true, new: true }
    );

    const container = buildInfoContainer({
      color,
      title: "👋 Despedida Configurada",
      description:
        `> 📢 Canal: ${canal}\n` +
        `> 🎨 Color: \`${color}\`\n` +
        `> 🏷️ Icono: ${icono ? "Activado" : "Desactivado"}`,
      image: imagen,
      footer: interaction.guild.name
    });

    return interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });

  }

  // 🧪 TEST
  if (sub === "test") {

    const data = await Goodbye.findOne({
      guildId: interaction.guild.id
    });

    if (!data) {
      return interaction.reply({
        content: "❌ No hay despedida configurada",
        flags: 64
      });
    }

    const canal = interaction.guild.channels.cache.get(data.channelId);

    if (!canal) {
      return interaction.reply({
        content: "❌ Canal no encontrado",
        flags: 64
      });
    }

    const texto = data.message
      .replaceAll("{user}", interaction.user.tag)
      .replaceAll("{server}", interaction.guild.name)
      .replaceAll("{members}", interaction.guild.memberCount);

    const container = buildInfoContainer({
      color: data.color || "#ED4245",
      title: data.icon ? `Salida de ${interaction.guild.name}` : null,
      description: texto,
      thumbnail: interaction.user.displayAvatarURL({ dynamic: true, size: 4096 }),
      image: data.image,
      footer: interaction.guild.name
    });

    await canal.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });

    return interaction.reply({
      content: "✅ Despedida enviada correctamente",
      flags: 64
    });

  }

  // 🗑️ REMOVE
  if (sub === "remove") {

    const data = await Goodbye.findOne({
      guildId: interaction.guild.id
    });

    if (!data) {
      return interaction.reply({
        content: "❌ No hay despedida configurada",
        flags: 64
      });
    }

    await Goodbye.deleteOne({
      guildId: interaction.guild.id
    });

    return interaction.reply({
      content: "🗑️ Sistema de despedida eliminado",
      flags: 64
    });

  }

}
