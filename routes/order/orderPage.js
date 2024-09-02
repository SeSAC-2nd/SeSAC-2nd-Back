const express = require("express");
const controller = require("../../controller/order/Corder");
const router = express.Router();

// 결제 페이지(주문서) 이동
router.post("/", controller.getOrderPage);

module.exports = router;
