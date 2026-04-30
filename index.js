import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Responde con pong"),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Muestra los comandos disponibles")
];

// 🔐 Registrar comandos automáticamente
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("🔄 Registrando comandos slash...");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands.map(cmd => cmd.toJSON()) }
    );

    console.log("✅ Comandos registrados correctamente");
  } catch (error) {
    console.error(error);
  }
})();

// 🚀 Evento ready
client.once("ready", () => {
  console.log(`🔥 NEXA está en línea como ${client.user.tag}`);
});

// 🎛️ Interacciones
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("🏓 Pong!");
  }

  if (interaction.commandName === "help") {
    await interaction.reply({
      content: "📖 Usa `/ping` para probar el bot.\nMás comandos próximamente...",
      ephemeral: true
    });
  }
});

// 🔑 Encender bot
client.login(process.env.TOKEN);
