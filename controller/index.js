const {
  Post,
  ProductImage,
  Category,
  Wishlist,
  sequelize,
} = require("../models/index");
const { col, fn, literal } = require("sequelize");

// 메인 페이지 이동(최신순, 인기순 판매글 목록)
exports.getMainPage = async (req, res) => {
  try {
    const newPostList = await Post.findAll({
      attributes: ["postId", "postTitle", "productPrice", "createdAt"],
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
    // const wishlistPostList = await Post.findAll({
    //   attributes: [
    //     "postId",
    //     "postTitle",
    //     "productPrice",
    //     "createdAt",
    //     [fn("COUNT", col("Wishlist.postId")), "wishlistCount"],
    //     "categoryId",
    //     "categoryName",
    //     "imgId",
    //     "imgName",
    //   ],
    //   include: [
    //     {
    //       model: Category,
    //       attributes: ["categoryId", "categoryName"],
    //     },
    //     {
    //       model: ProductImage,
    //       as: "Product_Images",
    //       attributes: ["imgId", "imgName"],
    //       where: { isThumbnail: true },
    //     },
    //     {
    //       model: Wishlist,
    //       attributes: [],
    //     },
    //   ],
    //   group: [
    //     "Post.postId",
    //     "Post.postTitle",
    //     "Post.productPrice",
    //     "Post.createdAt",
    //     "Category.categoryId",
    //     "Category.categoryName",
    //     "Product_Images.imgId",
    //     "Product_Images.imgName",
    //   ],
    //   order: [
    //     [fn("COUNT", col("Wishlist.postId")), "DESC"],
    //     ["createdAt", "DESC"],
    //   ],
    //   limit: 8,
    // });
    res.json({ newPostList });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
