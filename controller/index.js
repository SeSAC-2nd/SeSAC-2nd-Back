const {
  Post,
  ProductImage,
  Category,
  Wishlist,
  sequelize,
} = require("../models/index");

// 메인 페이지 이동(최신순, 인기순 판매글 목록)
exports.getMainPage = async (req, res) => {
  try {
    const newPostList = await Post.findAll({
      attributes: [
        "postId",
        "postTitle",
        "productPrice",
        "createdAt",
        "sellStatus",
      ],
      where: { isDeleted: false },
      include: [
        {
          model: Category,
          attributes: ["categoryName"], // 카테고리 이름만 가져옴
        },
        {
          model: ProductImage,
          attributes: ["imgName"],
          where: { isThumbnail: true },
        },
      ],
      order: [["createdAt", "DESC"]], // 최신순 정렬
      limit: 8,
    });

    const lowPriceList = await Post.findAll({
      attributes: [
        "postId",
        "postTitle",
        "productPrice",
        "createdAt",
        "sellStatus",
      ],
      where: { isDeleted: false },
      include: [
        {
          model: Category,
          attributes: ["categoryName"], // 카테고리 이름만 가져옴
        },
        {
          model: ProductImage,
          attributes: ["imgName"],
          where: { isThumbnail: true },
        },
      ],
      order: [["productPrice", "ASC"]], // 낮은 가격순 정렬
      limit: 8,
    });
    res.json({ newPostList, lowPriceList });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
