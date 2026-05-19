import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} from "discord.js";

import Welcome from "../models/Welcome.js";

export const data = new SlashCommandBuilder()
  .setName("welcome")
  .setDescription("Sistema de bienvenida")

  // ⚙️ CONFIGURAR
  .addSubcommand(sub =>
    sub.setName("set")
      .setDescription("Configurar bienvenida")

      .addChannelOption(option =>
        option.setName("canal")
          .setDescription("Canal de bienvenida")
          .setRequired(true)
      )

      .addStringOption(option =>
        option.setName("mensaje")
          .setDescription("Mensaje personalizado")
          .setRequired(true)
      )

      .addStringOption(option =>
        option.setName("color")
          .setDescription("Color HEX (#5865F2)")
          .setRequired(false)
      )

      .addStringOption(option =>
        option.setName("imagen")
          .setDescription("URL de imagen grande")
          .setRequired(false)
      )

      .addBooleanOption(option =>
        option.setName("icono")
          .setDescription("¿Mostrar icono del servidor?")
          .setRequired(false)
      )
  )

  // 🧪 TEST
  .addSubcommand(sub =>
    sub.setName("test")
      .setDescription("Probar bienvenida")
  )

  .setDefaultMemberPermissions(
    PermissionFlagsBits.Administrator
  );

export async function execute(interaction) {

  const sub = interaction.options.getSubcommand();

  // ⚙️ SET
  if (sub === "set") {

    const canal = interaction.options.getChannel("canal");
    const mensaje = interaction.options.getString("mensaje");
    const color = interaction.options.getString("color") || "#5865F2";
    const imagen = interaction.options.getString("imagen");
    const icono = interaction.options.getBoolean("icono") ?? true;

    await Welcome.findOneAndUpdate(
      {
        guildId: interaction.guild.id
      },
      {
        guildId: interaction.guild.id,
        channelId: canal.id,
        message: mensaje,
        color,
        image: imagen,
        icon: icono
      },
      {
        upsert: true
      }
    );

    return interaction.reply({
      content: `✅ Bienvenida configurada en ${canal}`,
      ephemeral: true
    });
  }

  // 🧪 TEST
  if (sub === "test") {

    const data = await Welcome.findOne({
      guildId: interaction.guild.id
    });

    if (!data) {
      return interaction.reply({
        content: "❌ No hay bienvenida configurada",
        ephemeral: true
      });
    }

    const canal = interaction.guild.channels.cache.get(data.channelId);

    if (!canal) {
      return interaction.reply({
        content: "❌ Canal no encontrado",
        ephemeral: true
      });
    }

    let texto = data.message
      .replace("{user}", `${interaction.user}`)
      .replace("{server}", interaction.guild.name);

    // 🎨 EMBED
    const embed = new EmbedBuilder()
      .setColor(data.color || "#5865F2")
      .setDescription(texto)
      .setFooter({
        text: "NEXA • Sistema de Bienvenida"
      })
      .setTimestamp();

    // 🖼️ icono server
    if (data.icon) {
      embed.setAuthor({
        name: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      });
    }

    // 🌄 imagen grande
    if (data.image) {
      embed.setImage(data.image);
    }

    // 👤 avatar usuario
    embed.setThumbnail(
      interaction.user.displayAvatarURL({ dynamic: true })
    );

    await canal.send({
      content: `${interaction.user}`,
      embeds: [embed]
    });

    return interaction.reply({
      content: "✅ Bienvenida enviada",
      ephemeral: true
    });
  }
  }
