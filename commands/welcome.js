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

  // 🧪 TEST
  .addSubcommand(sub =>
    sub.setName("test")
      .setDescription("Probar bienvenida")
  )

  // 🗑️ REMOVE
  .addSubcommand(sub =>
    sub.setName("remove")
      .setDescription("Eliminar bienvenida")
  )

  .setDefaultMemberPermissions(
    PermissionFlagsBits.ManageGuild
  );

export async function execute(interaction) {

  const sub =
    interaction.options.getSubcommand();

  // ⚙️ SET
  if (sub === "set") {

    const canal =
      interaction.options.getChannel("canal");

    const mensaje =
      interaction.options.getString("mensaje");

    const color =
      interaction.options.getString("color") ||
      "#5865F2";

    const imagen =
      interaction.options.getString("imagen");

    const icono =
      interaction.options.getBoolean("icono")
      ?? true;

    // 💾 Guardar config
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
        upsert: true,
        new: true
      }

    );

    // 🎨 EMBED RESPUESTA
    const embed = new EmbedBuilder()

      .setColor(color)

      .setAuthor({
        name: interaction.guild.name,
        iconURL:
          interaction.guild.iconURL({
            dynamic: true
          }) || null
      })

      .setDescription(
        `### ✅ Bienvenida Configurada\n\n` +
        `> 📢 Canal: ${canal}\n` +
        `> 🎨 Color: \`${color}\`\n` +
        `> 🏷️ Icono: ${icono ? "Activado" : "Desactivado"}`
      )

      .setFooter({
        text: interaction.guild.name,
        iconURL:
          interaction.guild.iconURL({
            dynamic: true
          }) || null
      })

      .setTimestamp();

    if (imagen) {
      embed.setImage(imagen);
    }

    return interaction.reply({
      embeds: [embed],
      flags: 64
    });

  }

  // 🧪 TEST
  if (sub === "test") {

    const data = await Welcome.findOne({
      guildId: interaction.guild.id
    });

    if (!data) {

      return interaction.reply({
        content:
          "❌ No hay bienvenida configurada",
        flags: 64
      });

    }

    // 📢 Canal
    const canal =
      interaction.guild.channels.cache.get(
        data.channelId
      );

    if (!canal) {

      return interaction.reply({
        content: "❌ Canal no encontrado",
        flags: 64
      });

    }

    // 📝 Variables
    const texto = data.message

      .replaceAll(
        "{user}",
        `${interaction.user}`
      )

      .replaceAll(
        "{server}",
        interaction.guild.name
      )

      .replaceAll(
        "{members}",
        interaction.guild.memberCount
      );

    // 🎨 EMBED
    const embed = new EmbedBuilder()

      .setColor(data.color || "#5865F2")

      .setDescription(texto)

      .setThumbnail(
        interaction.user.displayAvatarURL({
          dynamic: true,
          size: 4096
        })
      )

      .addFields(

        {
          name: "👤 Usuario",
          value: `${interaction.user}`,
          inline: true
        },

        {
          name: "👥 Miembros",
          value: `\`${interaction.guild.memberCount}\``,
          inline: true
        }

      )

      .setFooter({

        text: interaction.guild.name,

        iconURL:
          interaction.guild.iconURL({
            dynamic: true
          }) || null

      })

      .setTimestamp();

    // 🏷️ Icono arriba
    if (data.icon) {

      embed.setAuthor({

        name:
          `Bienvenido a ${interaction.guild.name}`,

        iconURL:
          interaction.guild.iconURL({
            dynamic: true
          }) || null

      });

    }

    // 🌄 Imagen grande
    if (data.image) {
      embed.setImage(data.image);
    }

    // 🚀 Enviar
    await canal.send({

      content: `${interaction.user}`,

      embeds: [embed]

    });

    return interaction.reply({

      content:
        "✅ Bienvenida enviada correctamente",

      flags: 64

    });

  }

  // 🗑️ REMOVE
  if (sub === "remove") {

    const data = await Welcome.findOne({
      guildId: interaction.guild.id
    });

    if (!data) {

      return interaction.reply({
        content:
          "❌ No hay bienvenida configurada",
        flags: 64
      });

    }

    await Welcome.deleteOne({
      guildId: interaction.guild.id
    });

    return interaction.reply({

      content:
        "🗑️ Sistema de bienvenida eliminado",

      flags: 64

    });

  }

                      }
