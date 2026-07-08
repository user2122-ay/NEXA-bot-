import mongoose from "mongoose";

const automodConfigSchema = new mongoose.Schema({

  guildId: {
    type: String,
    required: true,
    unique: true
  },

  enabled: {
    type: Boolean,
    default: false
  },

  logChannelId: {
    type: String,
    default: null
  },

  modules: {
    antiInvite: { type: Boolean, default: false },
    antiSpam: { type: Boolean, default: false },
    antiMassMention: { type: Boolean, default: false },
    antiBannedWords: { type: Boolean, default: false },
    antiCaps: { type: Boolean, default: false }
  },

  bannedWords: {
    type: [String],
    default: []
  },

  whitelistChannels: {
    type: [String],
    default: []
  },

  whitelistRoles: {
    type: [String],
    default: []
  },

  // ⚙️ Ajustes finos de cada módulo
  spamThreshold: {
    type: Number,
    default: 5 // mensajes
  },

  spamInterval: {
    type: Number,
    default: 5000 // ms
  },

  mentionThreshold: {
    type: Number,
    default: 5 // menciones en un solo mensaje
  },

  capsPercentage: {
    type: Number,
    default: 70 // % de mayúsculas
  },

  capsMinLength: {
    type: Number,
    default: 10 // largo mínimo del mensaje para evaluar mayúsculas
  },

  // 🚨 Escalado automático según cantidad de warns acumulados
  escalation: {
    timeoutAt: { type: Number, default: 3 },
    timeoutDuration: { type: Number, default: 600000 }, // 10 min en ms
    kickAt: { type: Number, default: 5 },
    banAt: { type: Number, default: 7 }
  }

}, {
  timestamps: true
});

export default mongoose.model("AutomodConfig", automodConfigSchema);

