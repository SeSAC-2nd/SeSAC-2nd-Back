const { Post, ProductImage, Seller, User } = require("../../models/index");

// 전체 판매글 목록(정렬 포함)
exports.getPostListPage = async (req, res) => {
  try {
    const { page, limit, categoryId } = req.params;

    const pageNumber = page ? parseInt(page, 10) : 1;
    const pageSize = limit ? parseInt(limit, 10) : 12;
    const offset = (pageNumber - 1) * pageSize;
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 판매글 검색 결과 목록
exports.getSearchResultsPage = async (req, res) => {
  try {
    const { page, limit } = req.params;
    const { postTitle } = req.query;

    const pageNumber = page ? parseInt(page, 10) : 1;
    const pageSize = limit ? parseInt(limit, 10) : 12;
    const offset = (pageNumber - 1) * pageSize;
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 판매글 등록
exports.insertPost = async (req, res) => {
  try {
    // sellerId는 session에서 가져오기
    const {
      sellerId,
      postTitle,
      postContent,
      productPrice,
      categoryId,
      productType,
      productStatus,
      isThumbnail,
    } = req.body;
    // sellStatus 는 '판매중' 자동으로 들어가게

    const newPost = await Post.create({
      sellerId,
      postTitle,
      postContent,
      productPrice,
      categoryId,
      productType,
      productStatus,
      sellStatus: "판매중",
    });
    // res.json(newPost);
    if (newPost) {
      const newProductImg = await ProductImage.create({
        postId: newPost.postId,
        imgName: "image.jpg",
        isThumbnail,
      });
      res.json({ newPost, newProductImg });
    }
    res.send(false);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 판매글 작성 페이지 이동
exports.getPostCreatePage = async (req, res) => {
  // 판매자 정보 등록 확인
  // 블랙리스트 여부 확인
};

// 판매글 상세 페이지
exports.getPostDetailPage = async (req, res) => {
  try {
    const { postId } = req.params;
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 판매글 수정
exports.updatePost = async (req, res) => {
  try {
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 판매글 삭제
exports.deletePost = async (req, res) => {
  try {
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
