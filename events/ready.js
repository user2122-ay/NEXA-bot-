import { ActivityType } from "discord.js";

export default {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`🔥 NEXA listo como ${client.user.tag}`);

    const estados = [
      { name: "servidores RP 🔥", type: ActivityType.Watching },
      { name: "tus comandos 👀", type: ActivityType.Watching },
      { name: "/help 📖", type: ActivityType.Listening },
      { name: "NEXA Systems ⚙️", type: ActivityType.Playing },
      { name: "tu servidor 🚀", type: ActivityType.Watching },
      { name: " PANAMÁ DEVWORKS STUDIOS 💻", type: ActivityType.Playing },
      { name: "configuraciones ⚙️", type: ActivityType.Watching },
      { name: "roles automáticos 🎭", type: ActivityType.Playing },
      { name: "usuarios 👤", type: ActivityType.Watching },
      { name: "slash commands ⚡", type: ActivityType.Playing },
      { name: "bots 🤖", type: ActivityType.Watching },
      { name: "tu actividad 👀", type: ActivityType.Watching },
      { name: "soporte 🛠️", type: ActivityType.Listening },
      { name: "tu comunidad 💬", type: ActivityType.Watching },
      { name: "eventos 🎉", type: ActivityType.Playing },
      { name: "moderación 🔒", type: ActivityType.Playing },
      { name: "NEXA AI 🧠", type: ActivityType.Playing },
      { name: "config web 🌐", type: ActivityType.Watching },
      { name: "Discord API ⚡", type: ActivityType.Playing },
      { name: "tu servidor crecer 📈", type: ActivityType.Watching }
    ];

    let i = 0;

    setInterval(() => {
      const estado = estados[i];

      client.user.setActivity(estado.name, { type: estado.type });

      i = (i + 1) % estados.length;
    }, 10000); // cambia cada 10 segundos
  }
};
