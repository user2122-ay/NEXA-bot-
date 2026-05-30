import {
  SlashCommandBuilder,
  PermissionFlagsBits
} from "discord.js";

import Autorole from "../models/Autorole.js";

export const data = new SlashCommandBuilder()

  .setName("autorole")
  .setDescription("Configura los autoroles")

  .addSubcommand(sub =>
    sub.setName("add")
      .setDescription("Añadir autorol")

      .addRoleOption(option =>
        option
          .setName("rol")
          .setDescription("Rol")
          .setRequired(true)
      )

      .addStringOption(option =>
        option
          .setName("tipo")
          .setDescription("Tipo")
          .setRequired(true)

          .addChoices(
            {
              name: "Usuario",
              value: "user"
            },
            {
              name: "Bot",
              value: "bot"
            }
          )
      )
  )

  .addSubcommand(sub =>
    sub.setName("remove")
      .setDescription("Eliminar autorol")

      .addRoleOption(option =>
        option
          .setName("rol")
          .setDescription("Rol")
          .setRequired(true)
      )
  )

  .addSubcommand(sub =>
    sub.setName("list")
      .setDescription("Ver autoroles")
  )

  .setDefaultMemberPermissions(
    PermissionFlagsBits.ManageRoles
  );

export async function execute(interaction) {

  const sub =
    interaction.options.getSubcommand();

  let data =
    await Autorole.findOne({
      guildId: interaction.guild.id
    });

  if (!data) {

    data = await Autorole.create({
      guildId: interaction.guild.id
    });

  }

  // ➕ ADD
  if (sub === "add") {

    const role =
      interaction.options.getRole("rol");

    const tipo =
      interaction.options.getString("tipo");

    if (tipo === "user") {

      if (data.userRoles.length >= 5) {

        return interaction.reply({
          content:
            "❌ Máximo 5 roles para usuarios.",
          flags: 64
        });

      }

      if (
        data.userRoles.includes(role.id)
      ) {

        return interaction.reply({
          content:
            "❌ Ese rol ya existe.",
          flags: 64
        });

      }

      data.userRoles.push(role.id);

    } else {

      if (data.botRoles.length >= 2) {

        return interaction.reply({
          content:
            "❌ Máximo 2 roles para bots.",
          flags: 64
        });

      }

      if (
        data.botRoles.includes(role.id)
      ) {

        return interaction.reply({
          content:
            "❌ Ese rol ya existe.",
          flags: 64
        });

      }

      data.botRoles.push(role.id);

    }

    await data.save();

    return interaction.reply({
      content:
        `✅ ${role} agregado como autorol (${tipo}).`,
      flags: 64
    });

  }

  // ❌ REMOVE
  if (sub === "remove") {

    const role =
      interaction.options.getRole("rol");

    data.userRoles =
      data.userRoles.filter(
        r => r !== role.id
      );

    data.botRoles =
      data.botRoles.filter(
        r => r !== role.id
      );

    await data.save();

    return interaction.reply({
      content:
        `🗑️ ${role} eliminado.`,
      flags: 64
    });

  }

  // 📋 LIST
  if (sub === "list") {

    const users =
      data.userRoles.length
        ? data.userRoles
            .map(id => `<@&${id}>`)
            .join("\n")
        : "Ninguno";

    const bots =
      data.botRoles.length
        ? data.botRoles
            .map(id => `<@&${id}>`)
            .join("\n")
        : "Ninguno";

    return interaction.reply({

      content:
`👤 Autoroles Usuario (${data.userRoles.length}/5)

${users}

🤖 Autoroles Bot (${data.botRoles.length}/2)

${bots}`,

      flags: 64

    });

  }

      }
