const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function () {
      return this.provider === "Email";
    },
  },
  provider: {
    type: String,
    enum: ["Email", "Google"],
    default: "Email",
  },
  avatarUrl: {
    type: String,
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true,
  },
});

module.exports = mongoose.model("User", userSchema);
