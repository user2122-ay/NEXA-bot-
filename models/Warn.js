import mongoose from "mongoose";

const warnSchema = new mongoose.Schema({

  guildId: {
    type: String,
    required: true
  },

  userId: {
    type: String,
    required: true
  },

  // "AUTOMOD" si fue automático, o el ID del moderador si fue manual
  moderatorId: {
    type: String,
    required: true
  },

  reason: {
    type: String,
    default: "Sin motivo especificado"
  }

}, {
  timestamps: true
});

export default mongoose.model("Warn", warnSchema);

