import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import AutomodConfig from "../models/AutomodConfig.js";
import Warn from "../models/Warn.js";

// 🧠 Cache en memoria para detectar spam (se reinicia si el bot se reinicia, es normal)
const spamCache = new Map();

const INVITE_REGEX = /(discord\.gg\/|discord(app)?\.com\/invite\/)[a-zA-Z0-9-]+/i;

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function handleViolation(message, config, reason) {

  // 🗑️ Borrar el mensaje infractor
  try {
    if (message.deletable) await message.delete();
  } catch (err) {
    console.error("⚠️ No se pudo borrar el mensaje:", err.message);
  }

  // 📝 Guardar la advertencia en la base de datos
  let warnCount = 0;
  try {
    await Warn.create({
      guildId: message.guild.id,
      userId: message.author.id,
      moderatorId: "AUTOMOD",
      reason
    });

    warnCount = await Warn.countDocuments({
      guildId: message.guild.id,
      userId: message.author.id
    });
  } catch (err) {
    console.error("⚠️ Error guardando warn:", err.message);
  }

  // 📩 Avisar al usuario por DM (si falla, no pasa nada)
  try {
    await message.author.send(
      `⚠️ Se eliminó tu mensaje en **${message.guild.name}**.\n` +
      `**Motivo:** ${reason}\n` +
      `**Advertencias acumuladas:** ${warnCount}`
    );
  } catch {
    // El usuario tiene los DMs cerrados, se ignora
  }

  // 🚨 Escalado automático de sanciones
  const { timeoutAt, timeoutDuration, kickAt, banAt } = config.escalation;
  const member = message.member;

  try {
    if (banAt && warnCount >= banAt && member.bannable) {
      await member.ban({ reason: `Automod: ${warnCount} advertencias acumuladas` });
    } else if (kickAt && warnCount >= kickAt && member.kickable) {
      await member.kick(`Automod: ${warnCount} advertencias acumuladas`);
    } else if (timeoutAt && warnCount >= timeoutAt && member.moderatable) {
      await member.timeout(timeoutDuration, `Automod: ${warnCount} advertencias acumuladas`);
    }
  } catch (err) {
    console.error("⚠️ Error aplicando sanción automática:", err.message);
  }

  // 📋 Enviar log al canal configurado
  if (config.logChannelId) {
    try {
      const channel = await message.guild.channels.fetch(config.logChannelId);

      if (channel) {
        const embed = new EmbedBuilder()
          .setColor("#ED4245")
          .setTitle("🛡️ Automod")
          .setDescription(
            `**Usuario:** ${message.author.tag} (${message.author.id})\n` +
            `**Canal:** <#${message.channel.id}>\n` +
            `**Motivo:** ${reason}\n` +
            `**Advertencias totales:** ${warnCount}`
          )
          .setTimestamp();

        await channel.send({ embeds: [embed] });
      }
    } catch (err) {
      console.error("⚠️ Error enviando log de automod:", err.message);
    }
  }
}

export default {
  name: "messageCreate",
  once: false,

  async execute(message) {

    // Ignorar DMs y bots (incluyéndose a sí mismo)
    if (!message.guild || message.author.bot) return;

    let config;
    try {
      config = await AutomodConfig.findOne({ guildId: message.guild.id });
    } catch (err) {
      console.error("⚠️ Error leyendo AutomodConfig:", err.message);
      return;
    }

    // Si no hay configuración o está desactivado, no hacer nada
    if (!config || !config.enabled) return;

    // ✅ Whitelist de canales
    if (config.whitelistChannels.includes(message.channel.id)) return;

    // ✅ Whitelist de roles
    const memberRoles = message.member?.roles.cache;
    if (memberRoles && config.whitelistRoles.some(r => memberRoles.has(r))) return;

    // ✅ Los administradores nunca son afectados
    if (message.member?.permissions.has(PermissionFlagsBits.Administrator)) return;

    const content = message.content || "";

    // 1️⃣ Anti-invite
    if (config.modules.antiInvite && INVITE_REGEX.test(content)) {
      return handleViolation(message, config, "Enlace de invitación no permitido");
    }

    // 2️⃣ Palabras prohibidas
    if (config.modules.antiBannedWords && config.bannedWords.length > 0) {
      const lower = content.toLowerCase();

      const found = config.bannedWords.find(word => {
        const re = new RegExp(`\\b${escapeRegex(word.toLowerCase())}\\b`, "i");
        return re.test(lower);
      });

      if (found) {
        return handleViolation(message, config, `Palabra prohibida detectada`);
      }
    }

    // 3️⃣ Menciones masivas
    if (config.modules.antiMassMention) {
      const mentionCount =
        message.mentions.users.size +
        message.mentions.roles.size +
        (message.mentions.everyone ? 1 : 0);

      if (mentionCount >= config.mentionThreshold) {
        return handleViolation(message, config, `Menciones masivas (${mentionCount})`);
      }
    }

    // 4️⃣ Exceso de mayúsculas
    if (config.modules.antiCaps && content.length >= config.capsMinLength) {
      const letters = content.replace(/[^a-zA-Z]/g, "");

      if (letters.length >= config.capsMinLength) {
        const upper = letters.replace(/[^A-Z]/g, "");
        const pct = (upper.length / letters.length) * 100;

        if (pct >= config.capsPercentage) {
          return handleViolation(message, config, "Exceso de mayúsculas");
        }
      }
    }

    // 5️⃣ Anti-spam (mensajes repetidos en poco tiempo)
    if (config.modules.antiSpam) {
      const key = `${message.guild.id}-${message.author.id}`;
      const now = Date.now();

      const timestamps = (spamCache.get(key) || [])
        .filter(t => now - t < config.spamInterval);

      timestamps.push(now);
      spamCache.set(key, timestamps);

      if (timestamps.length >= config.spamThreshold) {
        spamCache.set(key, []); // reiniciar para no disparar en cada mensaje siguiente
        return handleViolation(message, config, "Spam de mensajes");
      }
    }
  }
};

