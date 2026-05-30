import mongoose from "mongoose";

const goodbyeSchema = new mongoose.Schema({

  guildId: {
    type: String,
    required: true,
    unique: true
  },

  channelId: {
    type: String,
    required: true
  },

  message: {
    type: String,
    default: "😢 {user} abandonó {server}"
  },

  color: {
    type: String,
    default: "#ED4245"
  },

  image: {
    type: String,
    default: null
  },

  icon: {
    type: Boolean,
    default: true
  }

});

export default mongoose.model(
  "Goodbye",
  goodbyeSchema
);
