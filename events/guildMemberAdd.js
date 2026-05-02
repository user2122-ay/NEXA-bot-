import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export default {
  name: "guildMemberAdd",
  async execute(member) {
    try {
      const res = await pool.query(
        "SELECT * FROM welcome_config WHERE guild_id = $1",
        [member.guild.id]
      );

      if (!res.rows[0]) return;

      const channel = member.guild.channels.cache.get(res.rows[0].channel_id);
      if (!channel) return;

      await channel.send({
        content: `👋 Bienvenido ${member} a **${member.guild.name}** 🎉`
      });

    } catch (error) {
      console.error("WELCOME ERROR:", error);
    }
  }
};
