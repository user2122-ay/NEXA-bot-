import { Client, GatewayIntentBits, REST, Routes, Collection } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.commands = new Collection();

// 📂 Leer comandos automáticamente
const commands = [];
const commandsPath = path.resolve("./commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = `./commands/${file}`;
  const command = await import(filePath);

  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON());
}

// 🚀 Cuando el bot esté listo
client.once("ready", async () => {
  console.log(`🔥 NEXA está en línea como ${client.user.tag}`);

  try {
    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    console.log("🔄 Registrando comandos slash...");

    // ⚡ CAMBIA ESTO SEGÚN NECESITES
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );

    console.log("✅ Comandos registrados correctamente");
  } catch (error) {
    console.error(error);
  }
});

// 🎛️ Manejo de comandos
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "❌ Error ejecutando el comando",
      ephemeral: true
    });
  }
});

// 🔑 Encender bot
client.login(process.env.TOKEN);
