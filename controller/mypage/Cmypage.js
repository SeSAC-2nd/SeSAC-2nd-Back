const {
  User,
  Order,
  Post,
  ProductImage,
  Seller,
  Category,
  Wishlist,
  Address,
  OrderLogs,
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
      attributes: ["nickname", "balance", "profileImg"],
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
        attributes: ["postId", "postTitle", "productPrice"],
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
        attributes: ["postId", "postTitle", "productPrice"],
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
    const userId = req.session?.user.userId;

    // userId가 제공되지 않았거나 잘못된 경우 처리
    if (!userId) {
      return res.status(400).json({ error: "사용자 ID가 필요합니다." });
    }

    // 사용자 조회(아이디, 회원 이름, 닉네임, 전화번호, 이메일)
    const user = await User.findOne({
      attributes: [
        "loginId",
        "userName",
        "nickname",
        "phoneNum",
        "email",
        "profileImg",
      ],
      where: { userId },
    });

    const address = await Address.findOne({
      where: {
        userId,
        isDefault: true,
      },
    });

    // 사용자가 없을 경우 처리
    if (!user || !address) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    // 성공 응답
    res.status(200).json({ user, address });
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
        attributes: ["postId", "postTitle", "productPrice"],
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
      attributes: [
        "orderId",
        "allOrderId",
        "deliveryStatus",
        "isConfirmed",
        "invoiceNumber",
      ],
      where: { userId },
      include: [
        {
          model: Post,
          attributes: ["postId", "postTitle", "productPrice"],
          include: [
            {
              model: ProductImage,
              attributes: ["imgName"],
              where: { isThumbnail: true },
              required: true,
            },
          ],
        },
        {
          model: OrderLogs,
          attributes: ["logStatus"],
          where: { logStatus: "환불" },
          required: false, // 환불 로그가 없을 수도 있으므로 false로 설정
        },
      ],
    });

    if (orderHistory.length === 0) {
      orderHistoryMessage = "구매 내역이 없습니다.";
    } else {
      // '배송 중'인 주문의 deliveryStatus를 '배송 완료'로 업데이트
      const deliveryInProgressOrders = orderHistory.filter(
        (order) => order.deliveryStatus === "배송 중"
      );

      if (deliveryInProgressOrders.length > 0) {
        await Promise.all(
          deliveryInProgressOrders.map((order) =>
            Order.update(
              { deliveryStatus: "배송 완료" },
              { where: { orderId: order.orderId } }
            )
          )
        );
      }
    }

    // orderHistory에 logStatus가 '환불'인 경우만 포함하고, 그렇지 않으면 null로 설정
    orderHistory = orderHistory.map((order) => {
      const refundLog =
        order.Order_Logs.length > 0 ? order.Order_Logs[0].logStatus : null;
      return {
        ...order.toJSON(),
        logStatus: refundLog,
      };
    });

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

// 구매 확정
exports.updateOrderConfirm = async (req, res) => {
  try {
    const { orderId, postId } = req.body;

    // 해당 주문 조회
    const order = await Order.findOne({
      where: { orderId },
      attributes: ["orderId", "userId", "deliveryPrice"],
    });

    if (!order) {
      return res.status(404).json({ error: "주문을 찾을 수 없습니다." });
    }

    // 해당 판매글 조회
    const postDetail = await Post.findOne({
      where: { postId },
      attributes: ["postId", "productPrice"],
      include: [
        {
          model: Seller, // 판매자 정보
          attributes: ["sellerId"],
          include: [
            {
              model: User,
              attributes: ["userId", "balance"],
            },
          ],
        },
      ],
    });

    if (!postDetail) {
      return res.status(404).json({ error: "판매글을 찾을 수 없습니다." });
    }

    // 구매 확정 및 판매 상태 업데이트
    await Promise.all([
      Order.update(
        { isConfirmed: true },
        {
          where: { orderId },
        }
      ),
      Post.update({ sellStatus: "판매 완료" }, { where: { postId } }),
    ]);

    // 판매글 등록한 판매자의 회원 정보
    const seller = postDetail.Seller.User;
    const orderLogPrice = order.deliveryPrice + postDetail.productPrice;

    // 판매자의 잔고에 돈 입금
    await User.update(
      { balance: seller.balance + orderLogPrice },
      { where: { userId: seller.userId } }
    );

    // 중개 내역에 '출금'으로 입력
    const newOrderLog = await OrderLogs.create({
      managerId: 1,
      orderId,
      userId: order.userId,
      postId,
      orderLogPrice,
      deposit: null,
      withdraw: orderLogPrice,
      logStatus: "출금",
      createdAt: new Date(),
    });

    res
      .status(200)
      .json({ message: "주문이 성공적으로 처리되었습니다.", newOrderLog });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
