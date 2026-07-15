import {
  SlashCommandBuilder,
  MessageFlags
} from "discord.js";
import { buildLogContainer } from "../utils/componentsV2.js";

export const data = new SlashCommandBuilder()

  .setName("userinfo")
  .setDescription("Muestra información de un usuario")

  .addUserOption(option =>
    option
      .setName("usuario")
      .setDescription("Usuario a consultar")
      .setRequired(false)
  );

export async function execute(interaction) {

  const user = interaction.options.getUser("usuario") || interaction.user;
  const member = interaction.guild.members.cache.get(user.id);

  // 🎭 Roles
  let roles = "Ninguno";

  if (member) {

    const roleList = member.roles.cache
      .filter(r => r.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(r => `> ${r}`);

    if (roleList.length <= 0) {
      roles = "Ninguno";
    } else {
      const visibleRoles = roleList.slice(0, 15);
      roles = visibleRoles.join("\n");

      if (roleList.length > 15) {
        roles += `\n\n> Y ${roleList.length - 15} roles más...`;
      }
    }

  }

  const fields = [
    { name: "🆔 ID", value: `\`${user.id}\`` },
    { name: "🤖 Bot", value: user.bot ? "Sí" : "No" },
    { name: "📅 Cuenta creada", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>` }
  ];

  if (member) {
    fields.push(
      { name: "📥 Entró al servidor", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` },
      { name: `🎭 Roles (${member.roles.cache.size - 1})`, value: roles }
    );
  }

  const container = buildLogContainer({
    color: member?.displayHexColor || "#5865F2",
    title: "👤 Información de Usuario",
    thumbnail: user.displayAvatarURL({ dynamic: true, size: 4096 }),
    fields,
    footer: interaction.guild.name
  });

  await interaction.reply({
    components: [container],
    flags: MessageFlags.IsComponentsV2
  });

}

