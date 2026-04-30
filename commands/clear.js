import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("clear")
  .setDescription("Borra mensajes del canal")
  .addIntegerOption(option =>
    option.setName("cantidad")
      .setDescription("Cantidad de mensajes a borrar (1-100)")
      .setRequired(true)
  )
  // 🔥 SOLO ADMIN
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const cantidad = interaction.options.getInteger("cantidad");

  // 🔒 Verificación extra (por seguridad)
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "❌ No tienes permisos de administrador",
      ephemeral: true
    });
  }

  if (cantidad < 1 || cantidad > 100) {
    return interaction.reply({
      content: "❌ Debes elegir un número entre 1 y 100",
      ephemeral: true
    });
  }

  await interaction.channel.bulkDelete(cantidad, true);

  await interaction.reply({
    content: `🧹 Se borraron ${cantidad} mensajes`,
    ephemeral: true
  });
}
