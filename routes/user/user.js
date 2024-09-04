const express = require('express');
const router = express.Router();
const controller = require('../../controller/user/Cuser');

// 로그인
router.get('/login', controller.userLogin);

// 회원가입
router.post('/register', controller.userRegister);

// 로그인 아이디 중복 체크
router.get('/checkLoginid', controller.checkDuplicatedLoginid);

// 로그인 닉네임 중복 체크
router.get('/checkNickname', controller.checkDuplicatedNickname);

// 비밀번호 일치 확인
router.get('/checkPassword', controller.checkPassword);

// 로그아웃
router.get('/logout', controller.userLogout);

// 회원 정보 수정
router.patch('/:userId', controller.updateUser);

// 회원 조회
router.get('/:userId', controller.getUser);

// 회원 탈퇴
router.patch('/delete/:userId', controller.deleteUser);

module.exports = router;