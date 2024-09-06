const express = require("express");
const controller = require("../../controller/admin/Cadmin");
const router = express.Router();

// 전체회원조회 페이지 이동
router.get("/allUser", controller.getAllUserPage);

// 판매자조회 페이지 이동
router.get("/seller", controller.getSellerPage);

// 신고글조회 페이지 이동
router.get("/complaint", controller.getComplaintPage);

// 블랙리스트 관리 페이지 이동
router.get("/blacklist", controller.getBlacklistPage);

// 거래내역조회 페이지 이동
router.get("/orderlogs", controller.getOrderLogsPage);

// 블랙리스트 추가
router.patch("/blacklist", controller.updateBlacklist);

module.exports = router;
