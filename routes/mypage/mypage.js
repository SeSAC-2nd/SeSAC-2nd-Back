const express = require('express');
const router = express.Router();
const controller = require('../../controller/mypage/Cmypage');

// 마이 페이지 이동
router.get('/', controller.getMyPage);

// 회원 정보 수정 페이지 이동
router.get('/editUser', controller.getEditUserPage);

// 회원 탈퇴 페이지 이동
// router.get('/deleteUser', controller.getDeleteUserPage);

// 판매자 등록 페이지 이동
// router.get('/seller', controller.getCreateSellerPage);

// 판매 내역 페이지 이동
router.get('/salehistory', controller.getSalesHistoryPage);

// 송장 번호 등록(판매 내역 페이지)
router.patch('/invoiceNumber', controller.updateOrderInvoiceNumber)

// 판매글 목록 페이지 이동
router.get('/postlist', controller.getUserPostListPage);

// 구매 내역 페이지 이동
router.get('/orderhistory', controller.getOrderHistoryPage);

// 찜 목록 페이지 이동
router.get('/wishlist', controller.getWishlistPage);

// 배송지 관리 페이지 이동
router.get('/address', controller.getAddressPage);

module.exports = router;