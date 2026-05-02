import pool from "../database.js";

export default {
  name: "guildMemberAdd",
  async execute(member) {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM autoroles WHERE guild_id = $1",
        [member.guild.id]
      );

      if (!rows[0]) return;

      const roles = member.user.bot
        ? rows[0].bot_roles
        : rows[0].user_roles;

      for (const id of roles) {
        const role = member.guild.roles.cache.get(id);
        if (role) await member.roles.add(role).catch(() => {});
      }

    } catch (err) {
      console.error("EVENT ERROR:", err);
    }
  }
};
