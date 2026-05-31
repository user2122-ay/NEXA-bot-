module.exports = (client) => {

  client.on("messageCreate", (message) => {
    if (message.author.bot) return;

    const prefix = "!";

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "help") {
      message.reply(
        "📜 Centro de ayuda:\n\n" +
        "Soporte oficial del servidor:\n" +
        "https://discord.gg/4pmtzGBBdg"
      );
    }
  });

};
