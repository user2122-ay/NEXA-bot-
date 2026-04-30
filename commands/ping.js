import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Responde con pong");

export async function execute(interaction) {
  const sent = await interaction.reply({
    content: "🏓 Calculando ping...",
    fetchReply: true
  });

  const latency = sent.createdTimestamp - interaction.createdTimestamp;
  const apiPing = Math.round(interaction.client.ws.ping);

  await interaction.editReply(
    `🏓 Pong!\n📡 Latencia: ${latency}ms\n⚡ API: ${apiPing}ms`
  );
}
