import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

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
    size: 1024
  });

  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle(`🖼️ Avatar de ${user.tag}`)
    .setImage(avatarURL)
    .setDescription(`[🔗 Descargar avatar](${avatarURL})`)
    .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
