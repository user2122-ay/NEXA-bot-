import mongoose from "mongoose";

const LogsSchema = new mongoose.Schema({

  guildId: {
    type: String,
    required: true,
    unique: true
  },

  channelId: {
    type: String,
    required: true
  },

  logs: {

    bans: {
      type: Boolean,
      default: true
    },

    messages: {
      type: Boolean,
      default: true
    },

    roles: {
      type: Boolean,
      default: true
    },

    channels: {
      type: Boolean,
      default: true
    },

    nicknames: {
      type: Boolean,
      default: true
    },

    timeouts: {
      type: Boolean,
      default: true
    }, 
    
    members: {
  type: Boolean,
  default: true
    } 

  }

});

export default mongoose.model(
  "Logs",
  LogsSchema
);
