import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  ChannelType
} from "discord.js";
import AutomodConfig from "../models/AutomodConfig.js";
import Warn from "../models/Warn.js";
import { buildInfoContainer } from "../utils/componentsV2.js";

async function getOrCreateConfig(guildId) {
  let config = await AutomodConfig.findOne({ guildId });
  if (!config) {
    config = await AutomodConfig.create({ guildId });
  }
  return config;
}

export const data = new SlashCommandBuilder()
  .setName("automod")
  .setDescription("Configura el sistema de moderación automática")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

  .addSubcommand(sub =>
    sub.setName("setup")
      .setDescription("Activa el automod y define el canal de alertas")
      .addChannelOption(opt =>
        opt.setName("canal")
          .setDescription("Canal donde se enviarán las alertas")
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
      )
  )

  .addSubcommand(sub =>
    sub.setName("toggle")
      .setDescription("Activa o desactiva un módulo del automod")
      .addStringOption(opt =>
        opt.setName("modulo")
          .setDescription("Módulo a modificar")
          .setRequired(true)
          .addChoices(
            { name: "Automod (interruptor general)", value: "enabled" },
            { name: "Anti-invite", value: "antiInvite" },
            { name: "Anti-spam", value: "antiSpam" },
            { name: "Anti mención masiva", value: "antiMassMention" },
            { name: "Palabras prohibidas", value: "antiBannedWords" },
            { name: "Anti mayúsculas", value: "antiCaps" }
          )
      )
      .addBooleanOption(opt =>
        opt.setName("estado")
          .setDescription("Activar o desactivar")
          .setRequired(true)
      )
  )

  .addSubcommand(sub =>
    sub.setName("palabra")
      .setDescription("Añade o elimina una palabra de la lista de prohibidas")
      .addStringOption(opt =>
        opt.setName("accion")
          .setDescription("Añadir o eliminar")
          .setRequired(true)
          .addChoices(
            { name: "Añadir", value: "add" },
            { name: "Eliminar", value: "remove" }
          )
      )
      .addStringOption(opt =>
        opt.setName("palabra")
          .setDescription("La palabra a añadir o eliminar")
          .setRequired(true)
      )
  )

  .addSubcommand(sub =>
    sub.setName("warns")
      .setDescription("Muestra las advertencias de un usuario")
      .addUserOption(opt =>
        opt.setName("usuario")
          .setDescription("Usuario a consultar")
          .setRequired(true)
      )
  )

  .addSubcommand(sub =>
    sub.setName("resetwarns")
      .setDescription("Elimina todas las advertencias de un usuario")
      .addUserOption(opt =>
        opt.setName("usuario")
          .setDescription("Usuario a limpiar")
          .setRequired(true)
      )
  )

  .addSubcommand(sub =>
    sub.setName("config")
      .setDescription("Muestra la configuración actual del automod")
  );

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guild.id;

  // 🔒 Doble verificación de permisos
  if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
    return interaction.reply({
      content: "❌ No tienes permisos para usar este comando.",
      flags: 64
    });
  }

  if (sub === "setup") {
    const canal = interaction.options.getChannel("canal");
    const config = await getOrCreateConfig(guildId);

    config.logChannelId = canal.id;
    config.enabled = true;
    await config.save();

    return interaction.reply({
      content: `✅ Automod activado. Las alertas se enviarán a ${canal}.\nUsa \`/automod toggle\` para activar los módulos que quieras usar.`,
      flags: 64
    });
  }

  if (sub === "toggle") {
    const modulo = interaction.options.getString("modulo");
    const estado = interaction.options.getBoolean("estado");
    const config = await getOrCreateConfig(guildId);

    if (modulo === "enabled") {
      config.enabled = estado;
    } else {
      config.modules[modulo] = estado;
    }

    await config.save();

    return interaction.reply({
      content: `✅ Módulo **${modulo}** ${estado ? "activado" : "desactivado"}.`,
      flags: 64
    });
  }

  if (sub === "palabra") {
    const accion = interaction.options.getString("accion");
    const palabra = interaction.options.getString("palabra").toLowerCase();
    const config = await getOrCreateConfig(guildId);

    if (accion === "add") {
      if (!config.bannedWords.includes(palabra)) {
        config.bannedWords.push(palabra);
        await config.save();
      }

      return interaction.reply({
        content: `✅ Palabra añadida a la lista de prohibidas. (${config.bannedWords.length} en total)`,
        flags: 64
      });
    } else {
      config.bannedWords = config.bannedWords.filter(w => w !== palabra);
      await config.save();

      return interaction.reply({
        content: `✅ Palabra eliminada de la lista. (${config.bannedWords.length} en total)`,
        flags: 64
      });
    }
  }

  if (sub === "warns") {
    const usuario = interaction.options.getUser("usuario");
    const warns = await Warn.find({ guildId, userId: usuario.id })
      .sort({ createdAt: -1 })
      .limit(15);

    if (warns.length === 0) {
      return interaction.reply({
        content: `${usuario.tag} no tiene advertencias.`,
        flags: 64
      });
    }

    const container = buildInfoContainer({
      color: "#F0B232",
      title: `⚠️ Advertencias de ${usuario.tag}`,
      description: warns.map((w, i) =>
        `**${i + 1}.** ${w.reason} — <t:${Math.floor(w.createdAt.getTime() / 1000)}:R>`
      ).join("\n"),
      footer: `Total: ${warns.length}`
    });

    return interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });
  }

  if (sub === "resetwarns") {
    const usuario = interaction.options.getUser("usuario");
    await Warn.deleteMany({ guildId, userId: usuario.id });

    return interaction.reply({
      content: `✅ Advertencias de ${usuario.tag} eliminadas.`,
      flags: 64
    });
  }

  if (sub === "config") {
    const config = await getOrCreateConfig(guildId);

    const container = buildInfoContainer({
      color: "#5865F2",
      title: "🛡️ Configuración de Automod",
      description:
        `**Estado general:** ${config.enabled ? "🟢 Activado" : "🔴 Desactivado"}\n` +
        `**Canal de alertas:** ${config.logChannelId ? `<#${config.logChannelId}>` : "No configurado"}\n\n` +
        `**Módulos:**\n` +
        `Anti-invite: ${config.modules.antiInvite ? "✅" : "❌"}\n` +
        `Anti-spam: ${config.modules.antiSpam ? "✅" : "❌"}\n` +
        `Anti mención masiva: ${config.modules.antiMassMention ? "✅" : "❌"}\n` +
        `Palabras prohibidas: ${config.modules.antiBannedWords ? "✅" : "❌"} (${config.bannedWords.length} palabras)\n` +
        `Anti mayúsculas: ${config.modules.antiCaps ? "✅" : "❌"}`
    });

    return interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });
  }
}
