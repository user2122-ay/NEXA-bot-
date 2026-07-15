import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  MessageFlags
} from "discord.js";
import { buildLogContainer } from "../utils/componentsV2.js";

export const data = new SlashCommandBuilder()
  .setName("serverinfo")
  .setDescription("Muestra información del servidor");

export async function execute(interaction) {

  const { guild } = interaction;

  // 👑 Dueño
  const owner = await guild.fetchOwner();

  // 📅 Fecha
  const createdAt = `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`;

  // 👥 Miembros
  const memberCount = guild.memberCount;

  // 📂 Canales
  const channels = guild.channels.cache;
  const textChannels = channels.filter(c => c.type === 0).size;
  const voiceChannels = channels.filter(c => c.type === 2).size;

  // 🎭 Roles ordenados
  const roles = guild.roles.cache
    .filter(r => r.id !== guild.id)
    .sort((a, b) => b.position - a.position)
    .map(r => r.toString());

  // 📄 Dividir roles en páginas
  const chunkSize = 15;
  const rolePages = [];

  for (let i = 0; i < roles.length; i += chunkSize) {
    rolePages.push(roles.slice(i, i + chunkSize).join("\n"));
  }

  let currentPage = 0;

  // 📦 Container (con los botones incrustados adentro, no como fila aparte)
  const createContainer = (page, actionRow) => {
    const container = buildLogContainer({
      color: "#5865F2",
      title: "📊 Información del Servidor",
      thumbnail: guild.iconURL({ dynamic: true, size: 4096 }),
      fields: [
        { name: "👑 Dueño", value: `${owner}` },
        { name: "🆔 ID", value: `\`${guild.id}\`` },
        { name: "👥 Miembros", value: `\`${memberCount}\`` },
        { name: "💬 Texto", value: `\`${textChannels}\`` },
        { name: "🔊 Voz", value: `\`${voiceChannels}\`` },
        { name: "📅 Creado", value: createdAt },
        { name: `🎭 Roles (${roles.length})`, value: rolePages[page] || "Sin roles" }
      ],
      footer: `${guild.name} • Página ${page + 1}/${rolePages.length || 1}`
    });

    if (actionRow) {
      container.addActionRowComponents(actionRow);
    }

    return container;
  };

  // 🔘 Botones (van dentro del container mismo, no en un componente aparte)
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("prev").setLabel("⬅️").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("next").setLabel("➡️").setStyle(ButtonStyle.Secondary)
  );

  // 🚀 Enviar
  const msg = await interaction.reply({
    components: [createContainer(currentPage, rolePages.length > 1 ? row : null)],
    flags: MessageFlags.IsComponentsV2,
    fetchReply: true
  });

  if (rolePages.length <= 1) return;

  const collector = msg.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 120000
  });

  collector.on("collect", async i => {

    if (i.user.id !== interaction.user.id) {
      return i.reply({
        content: "❌ Solo quien ejecutó el comando puede usar esto",
        flags: 64
      });
    }

    if (i.customId === "prev") {
      currentPage--;
      if (currentPage < 0) currentPage = rolePages.length - 1;
    }

    if (i.customId === "next") {
      currentPage++;
      if (currentPage >= rolePages.length) currentPage = 0;
    }

    await i.update({
      components: [createContainer(currentPage, row)],
      flags: MessageFlags.IsComponentsV2
    });

  });

  collector.on("end", async () => {

    const disabledRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("prev").setLabel("⬅️").setStyle(ButtonStyle.Secondary).setDisabled(true),
      new ButtonBuilder().setCustomId("next").setLabel("➡️").setStyle(ButtonStyle.Secondary).setDisabled(true)
    );

    await msg.edit({
      components: [createContainer(currentPage, disabledRow)],
      flags: MessageFlags.IsComponentsV2
    }).catch(() => {});

  });

}
