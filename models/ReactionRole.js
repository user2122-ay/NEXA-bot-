import mongoose from "mongoose";

const reactionRoleSchema =
new mongoose.Schema({

  guildId: {
    type: String,
    required: true
  },

  messageId: {
    type: String,
    required: true
  },

  emoji: {
    type: String,
    required: true
  },

  roleId: {
    type: String,
    required: true
  }

});

export default mongoose.model(
  "ReactionRole",
  reactionRoleSchema
);
