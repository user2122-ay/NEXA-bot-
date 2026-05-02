import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import pool from "../database.js";

export const data = new SlashCommandBuilder()
  .setName("autorole")
  .setDescription("Configurar autoroles")
  .addSubcommand(sub =>
    sub.setName("add")
      .addRoleOption(o => o.setName("rol").setRequired(true))
      .addStringOption(o =>
        o.setName("tipo").setRequired(true)
          .addChoices(
            { name: "Usuario", value: "user" },
            { name: "Bot", value: "bot" }
          )
      )
  )
  .addSubcommand(sub => sub.setName("list"))
  .addSubcommand(sub =>
    sub.setName("remove")
      .addRoleOption(o => o.setName("rol").setRequired(true))
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const guildId = interaction.guild.id;

  try {
    let { rows } = await pool.query(
      "SELECT * FROM autoroles WHERE guild_id = $1",
      [guildId]
    );

    if (!rows[0]) {
      await pool.query(
        "INSERT INTO autoroles (guild_id) VALUES ($1)",
        [guildId]
      );

      rows = (await pool.query(
        "SELECT * FROM autoroles WHERE guild_id = $1",
        [guildId]
      )).rows;
    }

    const data = rows[0];

    const userRoles = data.user_roles;
    const botRoles = data.bot_roles;

    const sub = interaction.options.getSubcommand();

    // ADD
    if (sub === "add") {
      const role = interaction.options.getRole("rol");
      const tipo = interaction.options.getString("tipo");

      const roles = tipo === "user" ? userRoles : botRoles;

      if (tipo === "user" && roles.length >= 5)
        return interaction.reply({ content: "❌ Máximo 5", ephemeral: true });

      if (tipo === "bot" && roles.length >= 2)
        return interaction.reply({ content: "❌ Máximo 2", ephemeral: true });

      if (roles.includes(role.id))
        return interaction.reply({ content: "❌ Ya existe", ephemeral: true });

      roles.push(role.id);

      await pool.query(
        `UPDATE autoroles SET ${tipo === "user" ? "user_roles" : "bot_roles"} = $1 WHERE guild_id = $2`,
        [roles, guildId]
      );

      return interaction.reply({ content: "✅ Añadido", ephemeral: true });
    }

    // LIST
    if (sub === "list") {
      return interaction.reply({
        content:
          `👤 Usuarios: ${userRoles.map(r => `<@&${r}>`).join(", ") || "Ninguno"}\n` +
          `🤖 Bots: ${botRoles.map(r => `<@&${r}>`).join(", ") || "Ninguno"}`,
        ephemeral: true
      });
    }

    // REMOVE
    if (sub === "remove") {
      const role = interaction.options.getRole("rol");

      const newUser = userRoles.filter(r => r !== role.id);
      const newBot = botRoles.filter(r => r !== role.id);

      await pool.query(
        "UPDATE autoroles SET user_roles = $1, bot_roles = $2 WHERE guild_id = $3",
        [newUser, newBot, guildId]
      );

      return interaction.reply({ content: "🗑️ Eliminado", ephemeral: true });
    }

  } catch (err) {
    console.error(err);
    return interaction.reply({
      content: "❌ Error real con la DB",
      ephemeral: true
    });
  }
}
