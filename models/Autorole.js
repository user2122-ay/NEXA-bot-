import mongoose from "mongoose";

const autoroleSchema = new mongoose.Schema({

  guildId: {
    type: String,
    required: true,
    unique: true
  },

  userRoles: {
    type: [String],
    default: []
  },

  botRoles: {
    type: [String],
    default: []
  }

});

export default mongoose.model(
  "Autorole",
  autoroleSchema
);
