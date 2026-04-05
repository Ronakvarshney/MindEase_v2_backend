const { default: mongoose } = require("mongoose");

const MessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  recieverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  readby: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
  },

  text: {
    type: String,
    required: true,
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Message", MessageSchema);
