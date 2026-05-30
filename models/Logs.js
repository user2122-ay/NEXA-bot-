import mongoose from "mongoose";

const logsSchema = new mongoose.Schema({

  guildId: {
    type: String,
    required: true,
    unique: true
  },

  channelId: {
    type: String,
    required: true
  }

});

export default mongoose.model(
  "Logs",
  logsSchema
);
