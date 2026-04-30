import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import pool from "../database.js";

export const data = new SlashCommandBuilder()
  .setName("autorole")
  .setDescription("Configura autoroles")
  .addSubcommand(sub =>
    sub.setName("add")
      .setDescription("Añadir autorole")
      .addRoleOption(option =>
        option.setName("rol")
          .setDescription("Rol a añadir")
          .setRequired(true)
      )
      .addStringOption(option =>
        option.setName("tipo")
          .setDescription("Tipo")
          .setRequired(true)
          .addChoices(
            { name: "Usuario", value: "user" },
            { name: "Bot", value: "bot" }
          )
      )
  )
  .addSubcommand(sub =>
    sub.setName("list")
      .setDescription("Ver autoroles")
  )
  .addSubcommand(sub =>
    sub.setName("remove")
      .setDescription("Eliminar autorole")
      .addRoleOption(option =>
        option.setName("rol")
          .setDescription("Rol a eliminar")
          .setRequired(true)
      )
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const guildId = interaction.guild.id;

  // 🔍 Buscar config
  let result = await pool.query(
    "SELECT * FROM autoroles WHERE guild_id = $1",
    [guildId]
  );

  let data = result.rows[0];

  // 🆕 Crear si no existe
  if (!data) {
    await pool.query(
      "INSERT INTO autoroles (guild_id) VALUES ($1)",
      [guildId]
    );

    result = await pool.query(
      "SELECT * FROM autoroles WHERE guild_id = $1",
      [guildId]
    );

    data = result.rows[0];
  }

  const sub = interaction.options.getSubcommand();

  // ➕ ADD
  if (sub === "add") {
    const role = interaction.options.getRole("rol");
    const tipo = interaction.options.getString("tipo");

    let roles = tipo === "user" ? data.user_roles : data.bot_roles;

    if (tipo === "user" && roles.length >= 5) {
      return interaction.reply({
        content: "❌ Máximo 5 roles para usuarios",
        ephemeral: true
      });
    }

    if (tipo === "bot" && roles.length >= 2) {
      return interaction.reply({
        content: "❌ Máximo 2 roles para bots",
        ephemeral: true
      });
    }

    if (roles.includes(role.id)) {
      return interaction.reply({
        content: "❌ Ese rol ya está configurado",
        ephemeral: true
      });
    }

    roles.push(role.id);

    await pool.query(
      `UPDATE autoroles SET ${tipo === "user" ? "user_roles" : "bot_roles"} = $1 WHERE guild_id = $2`,
      [roles, guildId]
    );

    return interaction.reply({
      content: `✅ Rol ${role} añadido (${tipo})`,
      ephemeral: true
    });
  }

  // 📋 LIST
  if (sub === "list") {
    const userRoles = data.user_roles.map(id => `<@&${id}>`).join(", ") || "Ninguno";
    const botRoles = data.bot_roles.map(id => `<@&${id}>`).join(", ") || "Ninguno";

    return interaction.reply({
      content: `👤 Usuarios: ${userRoles}\n🤖 Bots: ${botRoles}`,
      ephemeral: true
    });
  }

  // ❌ REMOVE
  if (sub === "remove") {
    const role = interaction.options.getRole("rol");

    let userRoles = data.user_roles.filter(id => id !== role.id);
    let botRoles = data.bot_roles.filter(id => id !== role.id);

    await pool.query(
      "UPDATE autoroles SET user_roles = $1, bot_roles = $2 WHERE guild_id = $3",
      [userRoles, botRoles, guildId]
    );

    return interaction.reply({
      content: `🗑️ Rol ${role} eliminado`,
      ephemeral: true
    });
  }
                                               }
