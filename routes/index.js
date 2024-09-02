const express = require("express");
const router = express.Router();

// 메인 페이지 이동(최신순, 인기순 판매글 목록)
router.get("/");

module.exports = router;
