import mongoose from "mongoose";

const welcomeSchema = new mongoose.Schema({

  // 🆔 ID del servidor
  guildId: {
    type: String,
    required: true
  },

  // 📢 Canal de bienvenida
  channelId: {
    type: String,
    required: true
  },

  // 💬 Mensaje personalizado
  message: {
    type: String,
    default: "👋 Bienvenido {user} a {server}"
  },

  // 🎨 Color embed
  color: {
    type: String,
    default: "#5865F2"
  },

  // 🌄 Imagen grande
  image: {
    type: String,
    default: null
  },

  // 🏷️ Mostrar icono del server
  icon: {
    type: Boolean,
    default: true
  }

});

export default mongoose.model("Welcome", welcomeSchema);
