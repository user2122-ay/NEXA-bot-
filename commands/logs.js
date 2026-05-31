import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} from "discord.js";

import Logs from "../models/Logs.js";

export const data = new SlashCommandBuilder()

  .setName("logs")

  .setDescription(
    "Configurar sistema de logs"
  )

  // ⚙️ SET
  .addSubcommand(sub =>
    sub

      .setName("set")

      .setDescription(
        "Configurar logs"
      )

      .addChannelOption(option =>
        option

          .setName("canal")

          .setDescription(
            "Canal de logs"
          )

          .setRequired(true)
      )

      .addBooleanOption(option =>
        option
          .setName("baneos")
          .setDescription(
            "Logs de baneos"
          )
      )

      .addBooleanOption(option =>
        option
          .setName("mensajes")
          .setDescription(
            "Logs de mensajes"
          )
      )

      .addBooleanOption(option =>
        option
          .setName("roles")
          .setDescription(
            "Logs de roles"
          )
      )

      .addBooleanOption(option =>
        option
          .setName("canales")
          .setDescription(
            "Logs de canales"
          )
      )

      .addBooleanOption(option =>
        option
          .setName("apodos")
          .setDescription(
            "Logs de apodos"
          )
      )

      .addBooleanOption(option =>
        option
          .setName("timeouts")
          .setDescription(
            "Logs de timeouts"
          )
      )
        .addBooleanOption(option =>
  option
    .setName("miembros")
    .setDescription(
      "Entradas y salidas"
    )
)
  )

  // 📊 VIEW
  .addSubcommand(sub =>
    sub

      .setName("view")

      .setDescription(
        "Ver configuración"
      )
  )

  // 🗑️ REMOVE
  .addSubcommand(sub =>
    sub

      .setName("remove")

      .setDescription(
        "Eliminar configuración"
      )
  )

  .setDefaultMemberPermissions(
    PermissionFlagsBits.ManageGuild
  );

export async function execute(
  interaction
) {

  const sub =
    interaction.options.getSubcommand();

  // =====================
  // SET
  // =====================

  if (sub === "set") {

    const canal =
      interaction.options.getChannel(
        "canal"
      );

    const logs = {

      bans:
        interaction.options.getBoolean(
          "baneos"
        ) ?? true,

      messages:
        interaction.options.getBoolean(
          "mensajes"
        ) ?? true,

      roles:
        interaction.options.getBoolean(
          "roles"
        ) ?? true,

      channels:
        interaction.options.getBoolean(
          "canales"
        ) ?? true,

      nicknames:
        interaction.options.getBoolean(
          "apodos"
        ) ?? true,

      timeouts:
        interaction.options.getBoolean(
          "timeouts"
        ) ?? true

    };

    await Logs.findOneAndUpdate(

      {
        guildId:
          interaction.guild.id
      },

      {
        guildId:
          interaction.guild.id,

        channelId:
          canal.id,

        logs

      },

      {
        upsert: true,
        new: true
      }

    );

    const embed =
      new EmbedBuilder()

        .setColor("#5865F2")

        .setTitle(
          "📋 Logs Configurados"
        )

        .setDescription(

          `📢 Canal: ${canal}\n\n` +

          `🔨 Baneos: ${
            logs.bans
              ? "✅"
              : "❌"
          }\n` +

          `💬 Mensajes: ${
            logs.messages
              ? "✅"
              : "❌"
          }\n` +

          `🎭 Roles: ${
            logs.roles
              ? "✅"
              : "❌"
          }\n` +

          `📁 Canales: ${
            logs.channels
              ? "✅"
              : "❌"
          }\n` +

          `📝 Apodos: ${
            logs.nicknames
              ? "✅"
              : "❌"
          }\n` +

          `🔇 Timeouts: ${
            logs.timeouts
              ? "✅"
              : "❌"
          }`

        )

        .setTimestamp();

    return interaction.reply({

      embeds: [embed],

      flags: 64

    });

  }

  // =====================
  // VIEW
  // =====================

  if (sub === "view") {

    const data =
      await Logs.findOne({

        guildId:
          interaction.guild.id

      });

    if (!data) {

      return interaction.reply({

        content:
          "❌ No hay logs configurados",

        flags: 64

      });

    }

    const embed =
      new EmbedBuilder()

        .setColor("#5865F2")

        .setTitle(
          "📊 Configuración Logs"
        )

        .setDescription(

          `📢 Canal: <#${data.channelId}>\n\n` +

          `🔨 Baneos: ${
            data.logs.bans
              ? "✅"
              : "❌"
          }\n` +

          `💬 Mensajes: ${
            data.logs.messages
              ? "✅"
              : "❌"
          }\n` +

          `🎭 Roles: ${
            data.logs.roles
              ? "✅"
              : "❌"
          }\n` +

          `📁 Canales: ${
            data.logs.channels
              ? "✅"
              : "❌"
          }\n` +

          `📝 Apodos: ${
            data.logs.nicknames
              ? "✅"
              : "❌"
          }\n` +

          `🔇 Timeouts: ${
            data.logs.timeouts
              ? "✅"
              : "❌"
          }`

        )

        .setTimestamp();

    return interaction.reply({

      embeds: [embed],

      flags: 64

    });

  }

  // =====================
  // REMOVE
  // =====================

  if (sub === "remove") {

    await Logs.deleteOne({

      guildId:
        interaction.guild.id

    });

    return interaction.reply({

      content:
        "🗑️ Configuración de logs eliminada",

      flags: 64

    });

  }

}
