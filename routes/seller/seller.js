const express = require('express');
const router = express.Router();
const controller = require('../../controller/seller/Cseller');

// 판매자 등록
router.post('/', upload.single('seller-img'), controller.insertSeller);

// 판매자 조회
router.get('/:sellerId', controller.getSeller);

// 판매자 수정
router.patch('/:sellerId', upload.single('seller-img'), controller.updateSeller);

// 판매자 삭제
router.patch('/delete/:sellerId', controller.deleteSeller);

module.exports = router;