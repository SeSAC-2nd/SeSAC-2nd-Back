const express = require("express");
const router = express.Router();
const controller = require("../../controller/comment/Ccomment");

//댓글, 대댓글 목록 조회
router.get('/list/:postId', controller.getCommentList);

// 댓글 등록
router.post("/:postId", controller.insertComment);

// 댓글, 대댓글 수정
router.patch("/update/:comId", controller.updateComment);

// 댓글 삭제
router.patch("/delete/:comId", controller.deleteComment);

// 대댓글 삭제
router.patch("/reply/delete/:comId", controller.deleteCommentReply);

// 대댓글 등록
router.post("/reply/:comId", controller.insertReply);

module.exports = router;
