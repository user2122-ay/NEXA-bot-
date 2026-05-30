import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} from "discord.js";

import Logs from "../models/Logs.js";

export const data = new SlashCommandBuilder()

  .setName("logs")
  .setDescription("Sistema de registros")

  .addSubcommand(sub =>
    sub
      .setName("set")
      .setDescription("Configurar canal de logs")

      .addChannelOption(option =>
        option
          .setName("canal")
          .setDescription("Canal de registros")
          .setRequired(true)
      )
  )

  .addSubcommand(sub =>
    sub
      .setName("remove")
      .setDescription("Eliminar configuración")
  )

  .addSubcommand(sub =>
    sub
      .setName("test")
      .setDescription("Enviar prueba")
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

    await Logs.findOneAndUpdate(

      {
        guildId: interaction.guild.id
      },

      {
        guildId: interaction.guild.id,
        channelId: canal.id
      },

      {
        upsert: true,
        new: true
      }

    );

    const embed = new EmbedBuilder()

      .setColor("#5865F2")

      .setTitle("📜 Logs Configurados")

      .setDescription(
        `> 📢 Canal: ${canal}`
      )

      .setFooter({
        text: interaction.guild.name,
        iconURL:
          interaction.guild.iconURL({
            dynamic: true
          }) || null
      })

      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      flags: 64
    });

  }

  // 🧪 TEST
  if (sub === "test") {

    const data =
      await Logs.findOne({
        guildId: interaction.guild.id
      });

    if (!data) {

      return interaction.reply({
        content:
          "❌ No hay logs configurados",
        flags: 64
      });

    }

    const canal =
      interaction.guild.channels.cache.get(
        data.channelId
      );

    if (!canal) {

      return interaction.reply({
        content:
          "❌ Canal no encontrado",
        flags: 64
      });

    }

    const embed = new EmbedBuilder()

      .setColor("#57F287")

      .setTitle("🧪 Prueba de Logs")

      .setDescription(
        "El sistema de logs funciona correctamente."
      )

      .setFooter({
        text: interaction.guild.name,
        iconURL:
          interaction.guild.iconURL({
            dynamic: true
          }) || null
      })

      .setTimestamp();

    await canal.send({
      embeds: [embed]
    });

    return interaction.reply({
      content:
        "✅ Prueba enviada",
      flags: 64
    });

  }

  // 🗑️ REMOVE
  if (sub === "remove") {

    const data =
      await Logs.findOne({
        guildId: interaction.guild.id
      });

    if (!data) {

      return interaction.reply({
        content:
          "❌ No hay logs configurados",
        flags: 64
      });

    }

    await Logs.deleteOne({
      guildId: interaction.guild.id
    });

    return interaction.reply({
      content:
        "🗑️ Sistema de logs eliminado",
      flags: 64
    });

  }

}
