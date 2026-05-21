import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("serverinfo")
  .setDescription("Muestra información del servidor");

export async function execute(interaction) {

  const { guild } = interaction;

  // 👑 Dueño
  const owner = await guild.fetchOwner();

  // 📅 Fecha
  const createdAt =
    `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`;

  // 👥 Miembros
  const memberCount = guild.memberCount;

  // 📂 Canales
  const channels = guild.channels.cache;

  const textChannels =
    channels.filter(c => c.type === 0).size;

  const voiceChannels =
    channels.filter(c => c.type === 2).size;

  // 🎭 Roles ordenados
  const roles = guild.roles.cache
    .filter(r => r.id !== guild.id)
    .sort((a, b) => b.position - a.position)
    .map(r => r.toString());

  // 📄 Dividir roles en páginas
  const chunkSize = 15;

  const rolePages = [];

  for (let i = 0; i < roles.length; i += chunkSize) {

    rolePages.push(
      roles.slice(i, i + chunkSize).join("\n")
    );

  }

  let currentPage = 0;

  // 🎨 EMBED
  const createEmbed = (page) => {

    return new EmbedBuilder()

      .setColor("#5865F2")

      .setAuthor({
        name: guild.name,
        iconURL:
          guild.iconURL({ dynamic: true }) ||
          interaction.user.displayAvatarURL()
      })

      .setThumbnail(
        guild.iconURL({
          dynamic: true,
          size: 4096
        })
      )

      .setDescription(
        `### 📊 Información del Servidor`
      )

      .addFields(

        {
          name: "👑 Dueño",
          value: `${owner}`,
          inline: true
        },

        {
          name: "🆔 ID",
          value: `\`${guild.id}\``,
          inline: true
        },

        {
          name: "👥 Miembros",
          value: `\`${memberCount}\``,
          inline: true
        },

        {
          name: "💬 Texto",
          value: `\`${textChannels}\``,
          inline: true
        },

        {
          name: "🔊 Voz",
          value: `\`${voiceChannels}\``,
          inline: true
        },

        {
          name: "📅 Creado",
          value: createdAt,
          inline: false
        },

        {
          name: `🎭 Roles (${roles.length})`,
          value:
            rolePages[page] ||
            "Sin roles",
          inline: false
        }

      )

      .setFooter({
        text:
          `${guild.name} • Página ${page + 1}/${rolePages.length || 1}`,
        iconURL:
          guild.iconURL({ dynamic: true }) ||
          null
      })

      .setTimestamp();

  };

  // 🔘 Botones
  const row = new ActionRowBuilder()

    .addComponents(

      new ButtonBuilder()
        .setCustomId("prev")
        .setLabel("⬅️")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("➡️")
        .setStyle(ButtonStyle.Secondary)

    );

  // 🚀 Enviar
  const msg = await interaction.reply({

    embeds: [createEmbed(currentPage)],

    components:
      rolePages.length > 1
        ? [row]
        : [],

    fetchReply: true

  });

  // ❌ Si solo hay una página
  if (rolePages.length <= 1) return;

  // 🎛️ Collector
  const collector =
    msg.createMessageComponentCollector({

      componentType: ComponentType.Button,

      time: 120000

    });

  collector.on("collect", async i => {

    if (i.user.id !== interaction.user.id) {

      return i.reply({
        content:
          "❌ Solo quien ejecutó el comando puede usar esto",
        flags: 64
      });

    }

    // ⬅️
    if (i.customId === "prev") {

      currentPage--;

      if (currentPage < 0) {
        currentPage = rolePages.length - 1;
      }

    }

    // ➡️
    if (i.customId === "next") {

      currentPage++;

      if (currentPage >= rolePages.length) {
        currentPage = 0;
      }

    }

    // 🔄 Actualizar
    await i.update({

      embeds: [createEmbed(currentPage)],

      components: [row]

    });

  });

  // ⏳ Desactivar botones
  collector.on("end", async () => {

    const disabledRow = new ActionRowBuilder()

      .addComponents(

        new ButtonBuilder()
          .setCustomId("prev")
          .setLabel("⬅️")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),

        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("➡️")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)

      );

    await msg.edit({
      components: [disabledRow]
    }).catch(() => {});

  });

      }
