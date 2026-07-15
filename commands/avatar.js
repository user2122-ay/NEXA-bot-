import {
  SlashCommandBuilder,
  MessageFlags
} from "discord.js";
import { buildInfoContainer } from "../utils/componentsV2.js";

export const data = new SlashCommandBuilder()

  .setName("avatar")
  .setDescription("Muestra el avatar de un usuario")

  .addUserOption(option =>
    option
      .setName("usuario")
      .setDescription("Usuario a consultar")
      .setRequired(false)
  );

export async function execute(interaction) {

  const user = interaction.options.getUser("usuario") || interaction.user;

  const avatarURL = user.displayAvatarURL({
    dynamic: true,
    size: 4096
  });

  const container = buildInfoContainer({
    color: "#5865F2",
    title: `🖼️ Avatar de ${user.tag}`,
    description:
      `> Usuario: ${user}\n` +
      `> ID: \`${user.id}\`\n\n` +
      `[🔗 Descargar Avatar](${avatarURL})`,
    image: avatarURL,
    footer: interaction.guild.name
  });

  await interaction.reply({
    components: [container],
    flags: MessageFlags.IsComponentsV2
  });

}
