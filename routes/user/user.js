const express = require("express");
const router = express.Router();
const controller = require("../../controller/user/Cuser");
const {uploadSingle, logS3UploadResult} = require('../../middlewares/multer');

// 로그인
router.post("/login", controller.userLogin);

// 회원가입
router.post("/register", controller.userRegister);

// 로그인 아이디 중복 체크
router.post("/checkLoginid", controller.checkDuplicatedLoginid);

// 로그인 닉네임 중복 체크
router.post("/checkNickname", controller.checkDuplicatedNickname);

// 비밀번호 일치 확인
router.post("/checkPassword", controller.checkPassword);

// 로그아웃
router.get("/logout", controller.userLogout);

// 회원 정보 수정
router.patch("/:userId", uploadSingle.single(''), logS3UploadResult, controller.updateUser);

// 회원 조회
router.get("/:userId", controller.getUser);

// 회원 탈퇴
router.patch("/delete/:userId", controller.deleteUser);

module.exports = router;
