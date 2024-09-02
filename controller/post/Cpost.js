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
    // 판매글이 등록되면 이미지도 등록(여러장)
    if (newPost) {
      const newProductImg = await ProductImage.create({
        postId: newPost.postId,
        imgName: "image.jpg",
        isThumbnail,
      });
      res.json({ newPost, newProductImg });
    }
    // res.send(false);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 판매글 작성 페이지 이동
exports.getPostCreatePage = async (req, res) => {
  // 판매자 정보 등록 확인
  // userId는 session 에서 추출
  const { userId } = req.body;
  const seller = await Seller.findOne({ where: userId });
  if (!seller) {
    return res.send({
      isSeller: false,
      message:
        "판매하려면 판매자 등록이 필요합니다. 판매자 등록을 하시겠습니까?",
    });
  }

  // 블랙리스트 여부 확인
  const user = await User.findOne({ where: userId });
  if (user && user.isBlacklist) {
    return res.send({
      isBlacklist: true,
      message: "신고 누적으로 인해 글을 작성할 수 없습니다",
    });
  }
  return res.send({ result: true });
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
    const { postId } = req.params;
    const {
      postTitle,
      postContent,
      productPrice,
      categoryId,
      productType,
      productStatus,
      isThumbnail,
    } = req.body;
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 판매글 상세 조회
exports.getPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findOne({
      where: { postId },
      attributes: [
        "postTitle",
        "postContent",
        "productPrice",
        "categoryId",
        "productType",
        "productStatus",
      ],
      include: [
        {
          model: ProductImage,
          where: {
            postId,
          },
        },
      ],
    });
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 판매글 삭제
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const postDeleted = await Post.update(
      { isDeleted: true },
      { where: { postId } }
    );
    // 해당 게시물에 달린 댓글도 삭제 처리
    if (postDeleted[0] === 1) res.send({ result: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
