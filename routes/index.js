const express = require("express");
const router = express.Router();
const controller = require("../controller/index");

// 메인 페이지 이동(최신순, 인기순 판매글 목록)
router.get("/", controller.getMainPage);

module.exports = router;
