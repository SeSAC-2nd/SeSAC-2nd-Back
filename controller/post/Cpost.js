const { Post, ProductImage } = require("../../models/index");

// 판매글 등록
exports.insertPost = async (req, res) => {
  try {
    // 판매자 정보 등록 확인
    // 블랙리스트 여부 확인

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

// 판매글 조회

// 판매글 수정

// 판매글 삭제
