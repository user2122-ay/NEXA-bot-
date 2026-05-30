import { Client, GatewayIntentBits, REST, Routes, Collection } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { connectMongo } from "./mongo.js";

dotenv.config();

const client = new Client({
  intents: [

    GatewayIntentBits.Guilds,

    GatewayIntentBits.GuildMembers,

    GatewayIntentBits.GuildMessages,

    GatewayIntentBits.MessageContent,

    GatewayIntentBits.GuildModeration

  ]
});

client.commands = new Collection();

// 📂 CARGAR COMANDOS
const commands = [];
const commandsPath = path.resolve("./commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);

  if (!command.data || !command.execute) {
    console.log(`⚠️ El archivo ${file} está mal hecho`);
    continue;
  }

  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON());
}

//
// 🔥 NUEVO: CARGAR EVENTOS
//
const eventsPath = path.resolve("./events");
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = await import(`./events/${file}`);

  if (event.default.once) {
    client.once(event.default.name, (...args) => event.default.execute(...args));
  } else {
    client.on(event.default.name, (...args) => event.default.execute(...args));
  }
}

//
// 🚀 READY (solo para registrar comandos)
//
client.once("ready", async () => {
  console.log(`🔥 NEXA está en línea como ${client.user.tag}`);

  try {
    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    console.log("🔄 Registrando comandos globales...");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("✅ Comandos globales registrados");
  } catch (error) {
    console.error(error);
  }
});

//
// 🎛️ INTERACCIONES (COMANDOS)
//
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    if (!interaction.replied) {
      await interaction.reply({
        content: "❌ Error ejecutando el comando",
        ephemeral: true
      });
    }
  }
});
connectMongo();
// 🔑 LOGIN
client.login(process.env.TOKEN);
