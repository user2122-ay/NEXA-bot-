import {
  SlashCommandBuilder,
  PermissionFlagsBits
} from "discord.js";

import Logs from "../models/Logs.js";

export const data = new SlashCommandBuilder()

.setName("logs")
.setDescription("Configura los logs")

.addSubcommand(sub =>
  sub
    .setName("set")
    .setDescription("Configurar canal de logs")
)

.addSubcommand(sub =>
  sub
    .setName("remove")
    .setDescription("Eliminar logs")
)

.setDefaultMemberPermissions(
  PermissionFlagsBits.ManageGuild
);

export async function execute(interaction) {

  const sub =
    interaction.options.getSubcommand();

  if (sub === "set") {

    return interaction.reply({
      content:
        "⚠️ Aún no configurado",
      flags: 64
    });

  }

  if (sub === "remove") {

    return interaction.reply({
      content:
        "⚠️ Aún no configurado",
      flags: 64
    });

  }

}
