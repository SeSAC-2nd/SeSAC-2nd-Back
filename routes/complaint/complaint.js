const express = require("express");
const router = express.Router();
const controller = require("../../controller/complaint/Ccomplaint");

// 신고 등록
router.post("/", controller.insertComplaint);

module.exports = router;
