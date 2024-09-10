const {
  Post,
  ProductImage,
  Seller,
  User,
  Category,
  Delivery,
  Comment,
  Wishlist,
  sequelize,
} = require("../../models/index");
const { Op, where } = require("sequelize");

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
  const t = await sequelize.transaction({});
  try {
    const {
      postTitle,
      postContent,
      productPrice,
      categoryId,
      productType,
      productStatus,
    } = req.body;

    const sellerId = req.session.user.sellerId;

    if (!sellerId) {
      return res.status(403).json({
        error: "권한이 없는 접근입니다. - 판매자 정보가 등록되지 않았습니다.",
      });
    }

    const newPost = await Post.create(
      {
        sellerId,
        postTitle,
        postContent,
        productPrice,
        categoryId,
        productType,
        productStatus,
        sellStatus: "판매 중",
      },
      {
        transaction: t,
        lock: t.LOCK.UPDATE,
      }
    );

    if (newPost && req.files && req.files.length > 0) {
      const imagePromises = req.files.map(async (file, index) => {
        const thumbIndex = index === 0 ? true : false;
        return ProductImage.create(
          {
            postId: newPost.postId,
            imgName: file.key,
            imgUrl: file.location,
            isThumbnail: thumbIndex,
          },
          {
            transaction: t,
            lock: t.LOCK.UPDATE,
          }
        );
      });

      await Promise.all(imagePromises);
    } else if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ error: "이미지 파일이 제공되지 않았습니다." });
    }

    const newProductImg = await ProductImage.findOne(
      {
        where: { postId: newPost.postId, isThumbnail: true },
      },
      {
        transaction: t,
        lock: t.LOCK.SHARE,
      }
    );

    await t.commit();

    return res.status(201).json({
      newPost,
      newProductImg,
    });
  } catch (error) {
    await t.rollback();
    console.error("판매글 등록 오류:", error);
    res.status(500).json({ error: "판매글 등록 중 오류가 발생했습니다." });
  }
};

// 판매글 작성 페이지 이동
exports.getPostCreatePage = async (req, res) => {
  // 판매자 정보 등록 확인
  // userId는 session 에서 추출
  try {
    const { userId } = req.session.user;
    const seller = await Seller.findOne({ where: { userId } });
    let isSeller = false;
    let isBlacklist = false;

    // 판매자 정보 없으면
    if (!seller) {
      return res.send({
        isSeller, // false
        isBlacklist, //false
        message:
          "판매하려면 판매자 등록이 필요합니다. 판매자 등록을 하시겠습니까?",
      });
    } else {
      isSeller = true;
    }

    // 블랙리스트 여부 확인
    const user = await User.findOne({ where: userId });
    if (user && user.isBlacklist) {
      isBlacklist = true;
      return res.send({
        isSeller, // false
        isBlacklist, //true
        message: "신고 누적으로 인해 글을 작성할 수 없습니다",
      });
    }

    // 판매자 등록 되어있거나 블랙리스트가 아니면
    return res.status(200).json({
      isSeller, // true
      isBlacklist, // false
      message: "성공적인 응답",
    });
  } catch (err) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 판매글 상세 페이지 이동
exports.getPostDetailPage = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.session?.user?.userId;

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
      ],
    });
    if (!getPost) {
      return res
        .status(404)
        .json({ error: "존재하지 않는 데이터에 대한 접근입니다." });
    }

    let session = {};
    let isInWishlist = null;

    if (userId) {
      isInWishlist = await Wishlist.findOne({
        attributes: ["wishlistId"],
        where: {
          userId,
          postId,
        },
      });

      const checkSession = await User.findOne({
        where: { userId },
        include: [
          {
            model: Seller,
            attributes: ["sellerId"],
          },
        ],
      });

      session = {
        sellerId: checkSession.Seller?.sellerId || null,
        userId: checkSession.userId,
        nickname: checkSession.nickname,
        profileImg: checkSession.profileImg || "",
      };
    }

    res.json({ getPost, isInWishlist, session });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 판매글 수정
exports.updatePost = async (req, res) => {
  const t = await sequelize.transaction({});

  try {
    const { postId } = req.params;
    const {
      postTitle,
      postContent,
      productPrice,
      categoryId,
      productType,
      productStatus,
    } = req.body;

    const checkPost = await Post.findOne(
      {
        where: { postId },
      },
      {
        transaction: t,
        lock: t.LOCK.SHARE,
      }
    );

    if (!checkPost) {
      await t.rollback();
      return res.status(404).json({
        error: "존재하지 않는 게시글 입니다.",
      });
    }

    const updatedData = {
      sellerId: checkPost.sellerId,
      postTitle: postTitle || checkPost.postTitle,
      postContent: postContent || checkPost.postContent,
      productPrice: productPrice || checkPost.productPrice,
      categoryId: categoryId || checkPost.categoryId,
      productType: productType || checkPost.productType,
      productStatus: productStatus || checkPost.productStatus,
      sellStatus: "판매 중",
    };

    await Post.update(updatedData, {
      where: { postId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (checkPost && req.files && req.files.length > 0) {
      await ProductImage.destroy({
        where: { postId },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      const imagePromises = req.files.map(async (file, index) => {
        const thumbIndex = index === 0 ? true : false;
        return ProductImage.create(
          {
            postId: checkPost.postId,
            imgName: file.key,
            imgUrl: file.location,
            isThumbnail: thumbIndex,
          },
          {
            transaction: t,
            lock: t.LOCK.UPDATE,
          }
        );
      });
      await Promise.all(imagePromises);
    }

    await t.commit();

    return res.status(200).json({
      flag: true,
      desc: "flag - true 이면 성공한 응답, false 이면 실패한 응답",
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 판매글 수정 페이지 이동
exports.getPostUpdatePage = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findOne({
      where: { postId },
      attributes: [
        "sellerId",
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

    const checkSeller = await Seller.findOne({
      where: { sellerId: post.sellerId },
      attributes: ["userId"],
    });

    if (req.session.user.userId !== checkSeller.userId) {
      return res.status(403).json({ error: "권한이 없는 접근입니다." });
    }

    const session = {
      sellerId: post.sellerId,
      userId: checkSeller.userId,
    };

    res.status(200).json({ post, session });
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
