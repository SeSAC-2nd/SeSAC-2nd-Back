const express = require("express");
const router = express.Router();
const controller = require("../../controller/post/Cpost");

// 판매글 등록
router.post("/create", controller.insertPost);

// 판매글 조회

// 판매글 수정

// 판매글 삭제

module.exports = router;
