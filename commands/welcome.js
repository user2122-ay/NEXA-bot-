import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import pkg from "pg";

const { Pool } = pkg;

// 🔗 conexión directa (sin database.js)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export const data = new SlashCommandBuilder()
  .setName("welcome")
  .setDescription("Sistema de bienvenida")

  .addSubcommand(sub =>
    sub.setName("set")
      .setDescription("Configurar canal")
      .addChannelOption(option =>
        option.setName("canal")
          .setDescription("Canal de bienvenida")
          .setRequired(true)
      )
  )

  .addSubcommand(sub =>
    sub.setName("test")
      .setDescription("Probar bienvenida")
  )

  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const guildId = interaction.guild.id;
  const sub = interaction.options.getSubcommand();

  try {

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
        content: `✅ Canal configurado en ${channel}`,
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
          content: "❌ No configurado",
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
      content: "❌ Error con la base de datos",
      ephemeral: true
    });
  }
}
