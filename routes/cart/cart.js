const express = require("express");
const controller = require("../../controller/cart/Ccart");
const router = express.Router();

// 장바구니 페이지 이동(장바구니 내역 조회)
router.get("/", controller.getCartPage);

// 장바구니 등록
router.post("/:postId", controller.insertCart);

// 장바구니 삭제
router.delete("/:cartId", controller.deleteCart);

module.exports = router;
