import { EmbedBuilder } from "discord.js";

export default {

  name: "messageCreate",

  async execute(message) {

    if (message.author.bot) return;

    const prefix = "!";

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "help") {

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("📞 Centro de soporte")
        .setDescription("Servidor oficial de ayuda y soporte del sistema NEXA")
        .addFields({
          name: "🔗 Soporte",
          value: "https://discord.gg/4pmtzGBBdg"
        });

      await message.reply({ embeds: [embed] });
    }

  }

};
