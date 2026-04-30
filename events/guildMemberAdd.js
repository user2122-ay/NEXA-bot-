import pool from "../database.js";

export default {
  name: "guildMemberAdd",
  async execute(member) {
    const res = await pool.query(
      "SELECT * FROM autoroles WHERE guild_id = $1",
      [member.guild.id]
    );

    const data = res.rows[0];
    if (!data) return;

    const roles = member.user.bot ? data.bot_roles : data.user_roles;

    for (const roleId of roles) {
      const role = member.guild.roles.cache.get(roleId);
      if (role) {
        await member.roles.add(role).catch(() => {});
      }
    }
  }
};
