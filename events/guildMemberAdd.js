import pkg from "pg";
import { EmbedBuilder } from "discord.js";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default {
  name: "guildMemberAdd",
  async execute(member) {
    try {

      // 🧠 "despertar" DB (ping rápido)
      await pool.query("SELECT 1");

      // ⏳ pequeña espera para asegurar conexión
      await new Promise(res => setTimeout(res, 1200));

      const res = await pool.query(
        "SELECT * FROM welcome_config WHERE guild_id = $1",
        [member.guild.id]
      );

      if (!res.rows[0]) return;

      const channel = member.guild.channels.cache.get(res.rows[0].channel_id);
      if (!channel) return;

      // 🎨 EMBED PRO
      const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle(`👋 Bienvenido a ${member.guild.name}`)
        .setDescription(
          `Hola ${member},\n\n` +
          `Bienvenido a la comunidad.\n` +
          `Lee las reglas y disfruta tu estadía 🚀`
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          {
            name: "👥 Miembros",
            value: `${member.guild.memberCount}`,
            inline: true
          },
          {
            name: "🆔 Usuario",
            value: `${member.user.tag}`,
            inline: true
          }
        )
        .setFooter({
          text: "NEXA • Sistema de Bienvenida"
        })
        .setTimestamp();

      await channel.send({ embeds: [embed] });

    } catch (error) {
      console.error("WELCOME ERROR:", error);
    }
  }
};
