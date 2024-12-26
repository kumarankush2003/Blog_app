const express = require("express");
const router = express.Router();
const { createnewpost, updatepost, deletepost, get_post , likePost} = require("../controllers/Post_controller");
const { protect } = require("../middlewares/authMiddleware");
router.post("/create",protect, createnewpost);
router.post("/update/:id", protect, updatepost);
router.delete("/delete/:id", protect, deletepost);
router.get("/:id", protect, get_post);
router.post("/like/:id",protect,likePost);
module.exports = router;