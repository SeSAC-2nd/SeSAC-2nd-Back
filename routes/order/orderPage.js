const express = require("express");
const controller = require("../../controller/order/Corder");
const router = express.Router();

// 결제 페이지(주문서) 이동
router.post("/", controller.getOrderPage);

// 결제 완료 페이지 이동
router.get("/complete", controller.getOrderCompletePage);

module.exports = router;
