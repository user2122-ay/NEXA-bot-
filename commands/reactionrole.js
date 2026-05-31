import {
  SlashCommandBuilder,
  PermissionFlagsBits
} from "discord.js";

import ReactionRole from "../models/ReactionRole.js";

export const data =
new SlashCommandBuilder()

  .setName("reactionrole")

  .setDescription(
    "Crear reaction roles"
  )

  .addStringOption(option =>
    option

      .setName("mensaje_id")

      .setDescription(
        "ID del mensaje"
      )

      .setRequired(true)
  )

  .addStringOption(option =>
    option

      .setName("emoji")

      .setDescription(
        "Emoji"
      )

      .setRequired(true)
  )

  .addRoleOption(option =>
    option

      .setName("rol")

      .setDescription(
        "Rol a otorgar"
      )

      .setRequired(true)
  )

  .setDefaultMemberPermissions(
    PermissionFlagsBits.ManageRoles
  );

export async function execute(
  interaction
) {

  const messageId =
    interaction.options.getString(
      "mensaje_id"
    );

  const emoji =
    interaction.options.getString(
      "emoji"
    );

  const role =
    interaction.options.getRole(
      "rol"
    );

  await ReactionRole.create({

    guildId:
      interaction.guild.id,

    messageId,

    emoji,

    roleId: role.id

  });

  await interaction.reply({

    content:
      `✅ Reaction Role creado\nEmoji: ${emoji}\nRol: ${role}`,

    flags: 64

  });

}
