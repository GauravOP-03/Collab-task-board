const User = require("../models/user");

exports.getAllUsers = async (req, res) => {
  try {
    const user = await User.find().select("_id username email");
    res.status(200).json({
      message: "Users fetched successfully",
      users: user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "An error occurred while fetching users",
    });
  }
};
