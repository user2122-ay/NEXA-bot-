import mongoose from "mongoose";

const welcomeSchema = new mongoose.Schema({

  // 🆔 ID del servidor
  guildId: {
    type: String,
    required: true,
    unique: true
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

  // 🎨 Color del embed
  color: {
    type: String,
    default: "#5865F2"
  },

  // 🌄 Imagen grande
  image: {
    type: String,
    default: null
  },

  // 🏷️ Mostrar icono del servidor
  icon: {
    type: Boolean,
    default: true
  }

},
{
  timestamps: true
});

export default mongoose.model("Welcome", welcomeSchema);
