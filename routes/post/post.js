const express = require("express");
const router = express.Router();
const controller = require("../../controller/post/Cpost");

// 전체 판매글 목록(정렬 포함)
router.get("/list/:page/:limit/:categoryId", controller.getPostListPage);

// 판매글 검색 결과 목록
router.get(
  "/list/:page/:limit?postTitle=:keyword",
  controller.getSearchResultsPage
);

// 판매글 등록
router.post("/create", controller.insertPost);

// 판매글 작성 페이지 이동
router.get("/create", controller.getPostCreatePage);

// 판매글 상세 페이지 이동
router.get("/page/:postId", controller.getPostDetailPage);

// 판매글 수정
router.patch("/:postId", controller.updatePost);

// 판매글 상세 조회
router.get("/:postId", controller.getPost);

// 판매글 삭제
router.patch("/delete/:postId", controller.deletePost);

module.exports = router;