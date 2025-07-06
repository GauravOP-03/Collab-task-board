const express = require("express");
const { verifyToken } = require("../middleware/verify");
const {getAllUsers} = require("../controller/userController");

const router = express.Router();

router.get("/", verifyToken, getAllUsers);