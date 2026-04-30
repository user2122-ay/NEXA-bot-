import { Client, GatewayIntentBits, REST, Routes } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", async () => {
  console.log(`🧹 Limpiando comandos como ${client.user.tag}...`);

  try {
    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    // 🔥 BORRAR TODOS LOS COMANDOS GLOBALES
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: [] }
    );

    console.log("✅ TODOS los comandos globales fueron eliminados");
  } catch (error) {
    console.error(error);
  }
});

client.login(process.env.TOKEN);
