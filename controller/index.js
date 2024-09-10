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
      attributes: ["postId", "postTitle", "productPrice", "createdAt"],
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
    const query = `
        SELECT
            Post.postId,
            Post.postTitle,
            Post.productPrice,
            Post.createdAt,
            COUNT(Wishlist.postId) AS wishlistCount,
            Category.categoryId,
            Category.categoryName,
            Product_Images.imgId,
            Product_Images.imgName
        FROM
            Post
        LEFT JOIN Category ON Post.categoryId = Category.categoryId
        INNER JOIN Product_Image AS Product_Images
            ON Post.postId = Product_Images.postId
            AND Product_Images.isThumbnail = true
        LEFT JOIN Wishlist ON Post.postId = Wishlist.postId
        WHERE Post.isDeleted = 0
        GROUP BY
            Post.postId,
            Post.postTitle,
            Post.productPrice,
            Post.createdAt,
            Category.categoryId,
            Category.categoryName,
            Product_Images.imgId,
            Product_Images.imgName
        ORDER BY
            wishlistCount DESC,
            Post.createdAt DESC
        LIMIT 8;
    `;

    const [wishlistPostList, metadata] = await sequelize.query(query);
    res.json({ newPostList, wishlistPostList });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
