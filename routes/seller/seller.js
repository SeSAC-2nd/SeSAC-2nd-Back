const express = require('express');
const router = express.Router();
const controller = require('../../controller/seller/Cseller');
const {upload, logS3UploadResult} = require('../../middlewares/multer');


// 판매자 등록
router.post('/', upload.single('sellerImg'),logS3UploadResult, controller.insertSeller);

// 판매자 조회
router.get('/:sellerId', controller.getSeller);

// 판매자 수정
router.patch('/:sellerId', upload.single('sellerImg'), controller.updateSeller);

// 판매자 삭제
router.patch('/delete/:sellerId', controller.deleteSeller);

module.exports = router;