client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    const sent = await interaction.reply({
      content: "🏓 Calculando ping...",
      fetchReply: true
    });

    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiPing = Math.round(client.ws.ping);

    await interaction.editReply(
      `🏓 **Pong!**\n📡 Latencia: ${latency}ms\n⚡ API: ${apiPing}ms`
    );
  }

  if (interaction.commandName === "help") {
    await interaction.reply({
      content: "📖 Usa `/ping` para probar el bot.\nMás comandos próximamente...",
      ephemeral: true
    });
  }
});
