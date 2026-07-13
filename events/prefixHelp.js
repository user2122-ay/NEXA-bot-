import { MessageFlags } from "discord.js";
import { buildInfoContainer } from "../utils/componentsV2.js";

export default {

  name: "messageCreate",

  async execute(message) {

    if (message.author.bot) return;

    const prefix = "!";

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "help") {

      const container = buildInfoContainer({
        color: "#2b2d31",
        title: "📞 Centro de soporte",
        description:
          "Servidor oficial de ayuda y soporte del sistema NEXA\n\n" +
          "🔗 **Soporte:** https://discord.gg/4pmtzGBBdg"
      });

      await message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    }

  }

};
