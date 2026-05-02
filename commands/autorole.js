import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import pool from "../database.js";

export const data = new SlashCommandBuilder()
  .setName("autorole")
  .setDescription("Configura autoroles")
  .addSubcommand(sub =>
    sub.setName("add")
      .setDescription("Añadir autorole")
      .addRoleOption(option =>
        option.setName("rol").setDescription("Rol").setRequired(true)
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
    sub.setName("list").setDescription("Ver autoroles")
  )
  .addSubcommand(sub =>
    sub.setName("remove")
      .setDescription("Eliminar autorole")
      .addRoleOption(option =>
        option.setName("rol").setDescription("Rol").setRequired(true)
      )
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const guildId = interaction.guild.id;

  try {
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

    // 🛡️ PROTECCIÓN
    const userRolesDB = data?.user_roles || [];
    const botRolesDB = data?.bot_roles || [];

    const sub = interaction.options.getSubcommand();

    // ➕ ADD
    if (sub === "add") {
      const role = interaction.options.getRole("rol");
      const tipo = interaction.options.getString("tipo");

      let roles = tipo === "user" ? userRolesDB : botRolesDB;

      if (tipo === "user" && roles.length >= 5) {
        return interaction.reply({ content: "❌ Máximo 5 roles usuarios", ephemeral: true });
      }

      if (tipo === "bot" && roles.length >= 2) {
        return interaction.reply({ content: "❌ Máximo 2 roles bots", ephemeral: true });
      }

      if (roles.includes(role.id)) {
        return interaction.reply({ content: "❌ Ya existe ese rol", ephemeral: true });
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
      const userRoles = userRolesDB.length
        ? userRolesDB.map(id => `<@&${id}>`).join(", ")
        : "Ninguno";

      const botRoles = botRolesDB.length
        ? botRolesDB.map(id => `<@&${id}>`).join(", ")
        : "Ninguno";

      return interaction.reply({
        content: `👤 Usuarios: ${userRoles}\n🤖 Bots: ${botRoles}`,
        ephemeral: true
      });
    }

    // ❌ REMOVE
    if (sub === "remove") {
      const role = interaction.options.getRole("rol");

      const newUserRoles = userRolesDB.filter(id => id !== role.id);
      const newBotRoles = botRolesDB.filter(id => id !== role.id);

      await pool.query(
        "UPDATE autoroles SET user_roles = $1, bot_roles = $2 WHERE guild_id = $3",
        [newUserRoles, newBotRoles, guildId]
      );

      return interaction.reply({
        content: `🗑️ Rol ${role} eliminado`,
        ephemeral: true
      });
    }

  } catch (error) {
    console.error("ERROR AUTOROLE:", error);

    return interaction.reply({
      content: "❌ Error con la base de datos",
      ephemeral: true
    });
  }
}
