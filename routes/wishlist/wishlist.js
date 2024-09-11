const express = require("express");
const router = express.Router();
const controller = require("../../controller/wishlist/Cwishlist");

// 찜 등록
router.post("/", controller.insertWishlist);

// 찜 삭제
router.delete("/:wishlistId", controller.deleteWishlist);

module.exports = router;
