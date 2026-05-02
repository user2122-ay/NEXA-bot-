import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import pool from "../database.js";

export const data = new SlashCommandBuilder()
  .setName("welcome")
  .setDescription("Configurar sistema de bienvenida")

  .addSubcommand(sub =>
    sub.setName("set")
      .setDescription("Configurar canal de bienvenida")
      .addChannelOption(option =>
        option.setName("canal")
          .setDescription("Canal donde enviar bienvenida")
          .setRequired(true)
      )
  )

  .addSubcommand(sub =>
    sub.setName("test")
      .setDescription("Probar mensaje de bienvenida")
  )

  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const guildId = interaction.guild.id;

  try {
    const sub = interaction.options.getSubcommand();

    // 🔧 SET
    if (sub === "set") {
      const channel = interaction.options.getChannel("canal");

      await pool.query(
        `INSERT INTO welcome_config (guild_id, channel_id)
         VALUES ($1, $2)
         ON CONFLICT (guild_id)
         DO UPDATE SET channel_id = EXCLUDED.channel_id`,
        [guildId, channel.id]
      );

      return interaction.reply({
        content: `✅ Canal de bienvenida configurado en ${channel}`,
        ephemeral: true
      });
    }

    // 🧪 TEST
    if (sub === "test") {
      const res = await pool.query(
        "SELECT * FROM welcome_config WHERE guild_id = $1",
        [guildId]
      );

      if (!res.rows[0]) {
        return interaction.reply({
          content: "❌ No has configurado el sistema",
          ephemeral: true
        });
      }

      const channel = interaction.guild.channels.cache.get(res.rows[0].channel_id);

      if (!channel) {
        return interaction.reply({
          content: "❌ Canal no encontrado",
          ephemeral: true
        });
      }

      await channel.send({
        content: `👋 Bienvenido ${interaction.user} a **${interaction.guild.name}** 🎉`
      });

      return interaction.reply({
        content: "✅ Mensaje enviado",
        ephemeral: true
      });
    }

  } catch (error) {
    console.error(error);
    return interaction.reply({
      content: "❌ Error en la base de datos",
      ephemeral: true
    });
  }
}
