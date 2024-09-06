const {
  User,
  Order,
  Post,
  ProductImage,
  Seller,
  Category,
  Wishlist,
  Address,
} = require("../../models/index");

// 전체적으로 userId는 세션으로 바꾸는 것으로 수정

// 마이 페이지 이동
exports.getMyPage = async (req, res) => {
  try {
    const { userId } = req.session.user;

    // userId가 제공되지 않았거나 잘못된 경우 처리
    if (!userId) {
      return res.status(400).json({ error: "사용자 ID가 필요합니다." });
    }

    // [사용자] 사용자 조회 (회원 이름, 잔고)
    const user = await User.findOne({
      attributes: ["nickname", "balance"],
      where: { userId },
    });

    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    // [구매 내역] 회원 번호 조회
    const orders = await Order.findAll({
      attributes: ["postId"],
      where: { userId },
    });

    // [구매 내역] postId 배열 생성
    const postIds = orders.map((order) => order.postId);

    let purchasedPosts = [];
    let purchaseMessage = "";

    // [구매 내역] 구매 내역 조회(판매글 제목, 상품 가격, 이미지 파일명)
    if (postIds.length > 0) {
      purchasedPosts = await Post.findAll({
        attributes: ["postTitle", "productPrice"],
        where: { postId: postIds },
        include: [
          {
            model: ProductImage,
            attributes: ["imgName"],
            where: { isThumbnail: true },
            required: true,
          },
        ],
      });
    } else {
      purchaseMessage = "구매 내역이 없습니다.";
    }

    // [판매글 목록] 핀매자 조회(판매자 번호, 판매자명, 판매자 이미지, 판매자 설명)
    const seller = await Seller.findOne({
      attributes: ["sellerId", "sellerName", "sellerImg", "sellerExplain"],
      where: { userId },
    });

    let sellerPosts = [];
    let sellerMessage = "";

    // [판매글 목록] 판매글 조회 (판매글 제목, 상품 가격, 이미지 파일명)
    if (seller) {
      const sellerId = seller.sellerId;

      sellerPosts = await Post.findAll({
        attributes: ["postTitle", "productPrice"],
        where: { sellerId },
        include: [
          {
            model: ProductImage,
            attributes: ["imgName"],
            where: { isThumbnail: true },
            required: true,
          },
        ],
      });

      if (sellerPosts.length === 0) {
        sellerMessage = "판매글이 없습니다.";
      }
    } else {
      sellerMessage = "판매자 등록이 되어 있지 않습니다.";
    }

    return res.status(200).json({
      user,
      purchasedPosts,
      purchaseMessage,
      seller,
      sellerPosts,
      sellerMessage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 회원 정보 수정 페이지 이동
exports.getEditUserPage = async (req, res) => {
  try {
    const { userId } = req.session.user;

    // userId가 제공되지 않았거나 잘못된 경우 처리
    if (!userId) {
      return res.status(400).json({ error: "사용자 ID가 필요합니다." });
    }

    // 사용자 조회(아이디, 회원 이름, 닉네임, 전화번호, 이메일)
    const user = await User.findOne({
      attributes: ["loginId", "userName", "nickname", "phoneNum", "email"],
      where: { userId },
    });

    // 사용자가 없을 경우 처리
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    // 성공 응답
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 회원 탈퇴 페이지 이동
// exports.getDeleteUserPage = async (req, res) => {
//   try {

//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   }
// }

// 판매자 등록 페이지 이동
// exports.getCreateSellerPage = async (req, res) => {
//   try {

//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   }
// }

// 판매 내역 페이지 이동
exports.getSalesHistoryPage = async (req, res) => {
  try {
    const { userId } = req.session.user;

    // userId가 제공되지 않았거나 잘못된 경우 처리
    if (!userId) {
      return res.status(400).json({ error: "사용자 ID가 필요합니다." });
    }

    // 판매자 조회
    const seller = await Seller.findOne({
      attributes: ["sellerId"],
      where: { userId },
    });

    let sellerOrders = [];
    let sellerOrderMessage = "";

    // 판매 내역 조회 (주문 번호, 송장 번호, 판매글 제목, 상품 가격, 이미지 파일명)
    if (seller) {
      const sellerId = seller.sellerId;

      sellerOrders = await Order.findAll({
        attributes: [
          "allOrderId",
          "invoiceNumber",
          "orderId",
          "postId",
          "userId",
          "deliveryStatus",
          "isConfirmed",
        ],
        where: { sellerId },
        include: [
          {
            model: Post,
            attributes: ["postTitle", "productPrice", "sellStatus"],
            include: [
              {
                model: ProductImage,
                attributes: ["imgName"],
                where: { isThumbnail: true },
                required: true,
              },
            ],
          },
        ],
      });

      if (sellerOrders.length === 0) {
        sellerOrderMessage = "판매 내역이 없습니다.";
      }
    } else {
      sellerOrderMessage = "판매자 등록이 되어 있지 않습니다.";
    }

    return res.status(200).json({
      sellerOrders,
      sellerOrderMessage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 송장 번호 등록(판매 내역 페이지)
exports.updateOrderInvoiceNumber = async (req, res) => {
  try {
    const { orderIds, invoiceNumber } = req.body;

    // orderId와 invoiceNumber가 제공되지 않았거나 잘못된 경우 처리
    if (!orderIds || orderIds.length === 0 || !invoiceNumber) {
      return res
        .status(400)
        .json({ error: "주문 ID 혹은 송장 번호가 필요합니다." });
    }

    // 각 orderId에 대해 업데이트 수행
    for (const orderId of orderIds) {
      const order = await Order.findByPk(orderId);
      if (!order) {
        return res
          .status(404)
          .json({ error: `주문 ID ${orderId}를 찾을 수 없습니다.` });
      }

      // 데이터 업데이트
      await order.update({ invoiceNumber, deliveryStatus: "배송 중" });
    }

    // 성공 응답
    res.status(200).json({
      message: "송장 번호가 성공적으로 등록되었습니다.",
      invoiceNumber,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 판매글 목록 페이지 이동
exports.getUserPostListPage = async (req, res) => {
  try {
    const { userId } = req.session.user;

    // userId가 제공되지 않았거나 잘못된 경우 처리
    if (!userId) {
      return res.status(400).json({ error: "사용자 ID가 필요합니다." });
    }

    // 판매자 조회
    const seller = await Seller.findOne({
      attributes: ["sellerId"],
      where: { userId },
    });

    let sellerPosts = [];
    let sellerMessage = "";

    // Post 테이블에서 판매글 조회 (판매글 제목, 상품 가격, 이미지 파일명, 카테고리명)
    if (seller) {
      const sellerId = seller.sellerId;

      sellerPosts = await Post.findAll({
        attributes: ["postTitle", "productPrice"],
        where: { sellerId },
        include: [
          {
            model: ProductImage,
            attributes: ["imgName"],
            where: { isThumbnail: true },
            required: true,
          },
          {
            model: Category,
            attributes: ["categoryName"],
          },
        ],
      });

      if (sellerPosts.length === 0) {
        sellerMessage = "판매글이 없습니다.";
      }
    } else {
      sellerMessage = "판매자 등록이 되어 있지 않습니다.";
    }

    return res.status(200).json({
      seller,
      sellerPosts,
      sellerMessage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 구매 내역 페이지 이동
exports.getOrderHistoryPage = async (req, res) => {
  try {
    const { userId } = req.session.user;

    // userId가 제공되지 않았거나 잘못된 경우 처리
    if (!userId) {
      return res.status(400).json({ error: "사용자 ID가 필요합니다." });
    }

    // 구매 내역 조회(주문 번호, 배송 상태, 구매 확정 여부, 판매글 제목, 상품 가격, 이미지 파일명)
    let orderHistory = [];
    let orderHistoryMessage = "";

    orderHistory = await Order.findAll({
      attributes: ["allOrderId", "deliveryStatus", "isConfirmed"],
      where: { userId },
      include: [
        {
          model: Post,
          attributes: ["postTitle", "productPrice"],
          include: [
            {
              model: ProductImage,
              attributes: ["imgName"],
              where: { isThumbnail: true },
              required: true,
            },
          ],
        },
      ],
    });

    if (orderHistory.length === 0) {
      orderHistoryMessage = "구매 내역이 없습니다.";
    }

    return res.status(200).json({
      orderHistory,
      orderHistoryMessage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 찜 목록 페이지 이동
exports.getWishlistPage = async (req, res) => {
  try {
    const { userId } = req.session.user;

    // userId가 제공되지 않았거나 잘못된 경우 처리
    if (!userId) {
      return res.status(400).json({ error: "사용자 ID가 필요합니다." });
    }

    // 찜 목록 조회(판매글 제목, 상품 가격, 카테고리명, 이미지 파일명)
    let wishlist = [];
    let wishlistMessage = "";

    wishlist = await Wishlist.findAll({
      attributes: ["postId"],
      where: { userId },
      include: [
        {
          model: Post,
          attributes: ["postTitle", "productPrice"],
          include: [
            {
              model: Category,
              attributes: ["categoryName"],
            },
            {
              model: ProductImage,
              attributes: ["imgName"],
              where: { isThumbnail: true },
              required: true,
            },
          ],
        },
      ],
    });

    if (wishlist.length === 0) {
      wishlistMessage = "찜 목록이 없습니다.";
    }

    return res.status(200).json({
      wishlist,
      wishlistMessage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 배송지 관리 페이지 이동
exports.getAddressPage = async (req, res) => {
  try {
    const { userId } = req.session.user;

    // userId가 제공되지 않았거나 잘못된 경우 처리
    if (!userId) {
      return res.status(400).json({ error: "사용자 ID가 필요합니다." });
    }

    // 배송지 목록 조회(배송지명, 우편번호, 주소, 상세주소, 전화번호, 기본 배송지 여부, 받는 사람)
    let address = [];
    let addressMessage = "";

    address = await Address.findAll({
      attributes: [
        "addName",
        "zipCode",
        "address",
        "detailedAddress",
        "phoneNum",
        "isDefault",
        "receiver",
      ],
      where: { userId },
    });

    if (address.length === 0) {
      addressMessage = "배송지가 없습니다.";
    }

    return res.status(200).json({
      address,
      addressMessage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
