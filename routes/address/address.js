const express = require("express");
const router = express.Router();
const controller = require("../../controller/address/Caddress");

// 배송지 등록
router.post("/", controller.insertAddress);

// 회원 배송지 목록 조회
router.get("/list", controller.getAddressList);

// 배송지 조회
router.get("/:addId", controller.getAddress);

// 배송지 수정
router.patch("/:addId", controller.updateAddress);

// 배송지 삭제
router.delete("/:addId", controller.deleteAddress);

module.exports = router;
