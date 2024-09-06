const express = require("express");
const controller = require("../../controller/order/Corder");
const router = express.Router();

// 구매(결제) 데이터 등록
router.post("/", controller.insertOrder);

module.exports = router;
