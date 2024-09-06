const {
  Post,
  ProductImage,
  Seller,
  User,
  Category,
  Delivery,
  Comment,
} = require("../../models/index");
const { Op } = require("sequelize");

// 전체 판매글 목록(정렬 포함)
exports.getPostListPage = async (req, res) => {
  try {
    const { page, categoryId } = req.params;
    const { order } = req.query;

    const pageNumber = page ? parseInt(page, 10) : 1;
    const pageSize = 20;
    const offset = (pageNumber - 1) * pageSize;

    let orderCondition;

    switch (order) {
      case "priceHigh":
        orderCondition = [["productPrice", "DESC"]];
        break;
      case "priceLow":
        orderCondition = [["productPrice", "ASC"]];
        break;
      case "latest":
        orderCondition = [["createdAt", "DESC"]];
        break;
      default:
        orderCondition = [["createdAt", "DESC"]];
        break;
    }
    // 판매글이 삭제되지 않은, 블랙리스트의 글이 아닌 것
    let whereCondition = {
      isDeleted: false,
    };

    if (categoryId && categoryId >= 1 && categoryId <= 6) {
      whereCondition.categoryId = categoryId;
    }
    const [postCount, postList] = await Promise.all([
      Post.count({
        where: whereCondition,
      }),
      Post.findAll({
        attributes: [
          "postId",
          "postTitle",
          "productPrice",
          "categoryId",
          "sellStatus",
          "createdAt",
        ],
        limit: pageSize,
        offset: offset,
        order: orderCondition,
        where: whereCondition,

        include: [
          {
            model: Category,
            attributes: ["categoryName"],
            // required: false, // Use false in case a post has no image
          },
          {
            model: ProductImage,
            attributes: ["imgId", "imgName"],
            // required: false, // Use false in case a post has no image
            where: {
              isThumbnail: true,
            },
          },
        ],
      }),
    ]);
    // 총 페이지 개수
    const totalPages = Math.ceil(postCount / pageSize);

    res.status(200).json({
      postList,
      postCount, // 데이터 총 갯수
      pageSize, // 페이지 당 보여줄 데이터 개수
      totalPages, // 보여줄 페이지 개수
      currentPage: pageNumber, // 현재 페이지
    });
    // totalItems, // 데이터 총 갯수
    // pageSize, // 페이지 당 보여줄 데이터 개수
    // pageCount, // 보여줄 페이지 개수
    // pageNumber, // 현재 페이지
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 판매글 검색 결과 목록
exports.getSearchResultsPage = async (req, res) => {
  try {
    const { page } = req.params;
    const { postTitle } = req.query;

    const pageNumber = page ? parseInt(page, 10) : 1;
    const pageSize = 20;
    const offset = (pageNumber - 1) * pageSize;

    let whereCondition = {
      isDeleted: false,
    };

    if (postTitle) {
      whereCondition.postTitle = {
        [Op.like]: `%${postTitle}%`, // 부분 일치를 위해 like 사용
      };
    }

    const [postCount, postList] = await Promise.all([
      Post.count({
        where: whereCondition,
      }),
      Post.findAll({
        attributes: [
          "postId",
          "postTitle",
          "productPrice",
          "categoryId",
          "sellStatus",
          "createdAt",
        ],
        limit: pageSize,
        offset: offset,
        where: whereCondition,

        include: [
          {
            model: Category,
            attributes: ["categoryName"],
            // required: false, // Use false in case a post has no image
          },
          {
            model: ProductImage,
            attributes: ["imgId", "imgName"],
            // required: false, // Use false in case a post has no image
            where: {
              isThumbnail: true,
            },
          },
        ],
      }),
    ]);
    // 총 페이지 개수
    const totalPages = Math.ceil(postCount / pageSize);

    res.status(200).json({
      postList,
      postCount, // 데이터 총 갯수
      pageSize, // 페이지 당 보여줄 데이터 개수
      totalPages, // 보여줄 페이지 개수
      currentPage: pageNumber, // 현재 페이지
    });

    // totalItems, // 데이터 총 갯수
    // pageSize, // 페이지 당 보여줄 데이터 개수
    // pageCount, // 보여줄 페이지 개수
    // pageNumber, // 현재 페이지
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

// 판매글 상세 페이지 이동
exports.getPostDetailPage = async (req, res) => {
  try {
    const { postId } = req.params;
    const getPost = await Post.findOne({
      where: { postId },
      attributes: [
        "postId",
        "postTitle",
        "postContent",
        "productPrice",
        "productType",
        "productStatus",
        "sellStatus",
        "createdAt",
      ],
      include: [
        {
          model: Category,
          attributes: ["categoryName"],
        },
        {
          model: ProductImage,
          attributes: ["imgId", "imgName"],
        },
        {
          model: Seller, // 판매자 정보
          attributes: ["sellerId", "sellerName", "sellerImg"],
          include: [
            {
              model: Delivery,
              attributes: ["deliveryName", "deliveryFee"],
            },
          ],
        },
        {
          model: Comment, // 댓글
          attributes: [
            "comId",
            "userId",
            "comContent",
            "isSecret",
            "createdAt",
            "isDeleted",
          ],
          include: [
            {
              model: User, // 댓글 작성자 정보
              attributes: ["userId", "userName", "profileImg"], // 댓글 작성자 ID, 이름, 프로필 이미지
            },
            {
              model: Comment, // 대댓글
              attributes: [
                "comId",
                "userId",
                "comContent",
                "isSecret",
                "createdAt",
                "isDeleted",
                "parentComId",
              ],
              as: "replies",
              include: [
                {
                  model: User, // 대댓글 작성자 정보
                  attributes: ["userId", "userName", "profileImg"], // 대댓글 작성자 ID, 이름, 프로필 이미지
                },
              ],
            },
          ],
        },
      ],
    });
    res.json(getPost);
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

// 판매글 수정 페애지 이동
exports.getPostUpdatePage = async (req, res) => {
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
