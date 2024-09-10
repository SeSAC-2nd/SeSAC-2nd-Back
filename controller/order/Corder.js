const {
  Address,
  User,
  Cart,
  Post,
  Seller,
  Delivery,
  Category,
  ProductImage,
  Order,
  OrderLogs,
  sequelize,
} = require("../../models/index");

// 결제 페이지(주문서) 이동
exports.getOrderPage = async (req, res) => {
  try {
    // userId는 session에서 추출, cartIds는 배열로 받기
    const { userId } = req.session.user;
    const { cartIds } = req.body;
    const postInfo = await Cart.findAll({
      where: { cartId: cartIds },
      include: [
        {
          model: Post,
          include: [
            {
              model: Seller,
              include: [
                {
                  model: Delivery,
                  attributes: ["deliveryName", "deliveryFee"],
                },
              ],
              attributes: ["sellerName"],
            },
            {
              model: Category,
              attributes: ["categoryName"],
            },
            {
              model: ProductImage,
              attributes: ["imgName"],
              where: {
                isThumbnail: true,
              },
            },
          ],
          attributes: [
            "sellerId",
            "categoryId",
            "postTitle",
            "productPrice",
            "productType",
            "productStatus",
            "sellStatus",
          ],
        },
      ],
      attributes: ["cartId", "postId"],
    });
    const userInfo = await User.findOne({
      attributes: ["userName", "email", "phoneNum", "balance"],
      where: { userId },
    });
    const addressInfo = await Address.findOne({
      attributes: [
        "addName",
        "receiver",
        "phoneNum",
        "zipCode",
        "address",
        "detailedAddress",
      ],
      where: { userId, isDefault: true },
    });
    res.json({ userInfo, postInfo, addressInfo });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 구매(결제) 데이터 등록
exports.insertOrder = async (req, res) => {
  // userId는 session에서
  const { userId } = req.session.user;
  const { orderData } = req.body;

  // 모든 주문에 공통으로 적용될 orderId를 생성
  const allOrderId = generateUniqueOrderId();

  try {
    // 트랜잭션을 사용해 모든 작업을 하나의 트랜잭션으로 처리
    await sequelize.transaction(async (transaction) => {
      const user = await User.findOne({ where: { userId }, transaction });

      // 주문 총액 합산
      const totalOrderAmount = orderData.reduce(
        (sum, order) => sum + order.totalPrice,
        0
      );

      // 잔액 확인
      if (user.balance < totalOrderAmount) {
        throw new Error("Insufficient balance to complete the transaction.");
      }

      // 잔액 차감
      await user.update(
        { balance: user.balance - totalOrderAmount },
        { transaction }
      );

      // 주문 데이터 생성, 판매 상태 업데이트, 장바구니 데이터 삭제 및 로그 생성
      for (const order of orderData) {
        // 주문 생성
        const createdOrder = await Order.create(
          {
            userId,
            postId: order.postId,
            sellerId: order.sellerId,
            allOrderId,
            createdAt: new Date(),
            invoiceNumber: null,
            deliveryStatus: "배송 전",
            address: order.address,
            deliveryPrice: order.deliveryPrice,
          },
          { transaction }
        );

        // 해당 게시물의 판매 상태 및 결제 여부 업데이트
        await Post.update(
          {
            sellStatus: "판매 예약",
            isOrdered: true,
          },
          {
            where: { postId: order.postId },
            transaction,
          }
        );

        // 장바구니에서 해당 cartId에 해당하는 데이터 삭제
        await Cart.destroy({
          where: { cartId: order.cartId },
          transaction,
        });

        // Order_Logs에 insert
        await OrderLogs.create(
          {
            managerId: 1,
            orderId: createdOrder.orderId, // 생성된 주문의 orderId
            userId: userId,
            postId: order.postId,
            orderLogPrice: order.totalPrice,
            deposit: order.totalPrice,
            withdraw: null,
            logStatus: "입금",
            createdAt: new Date(),
          },
          { transaction }
        );
      }
    });

    res.status(201).json({
      message:
        "Order created, balance updated, post status changed, cart items deleted, and order logs created successfully.",
      allOrderId,
    });
  } catch (error) {
    console.error("Transaction failed:", error);
    res.status(500).send({ error: error.message });
  }
};

// // 고유한 주문 ID를 생성하는 함수
function generateUniqueOrderId() {
  return "ORD" + Math.floor(1000000 + Math.random() * 9000000).toString();
}

// 결제 완료 페이지 이동
exports.getOrderCompletePage = async (req, res) => {
  try {
    const { allOrderId } = req.params;
    const orders = await Order.findAll({
      where: { allOrderId },
      attributes: ["allOrderId", "address", "deliveryPrice"],
      include: [
        {
          model: Post,
          attributes: ["productPrice", "postTitle"],
        },
      ],
    });

    // 데이터 개수 계산
    const orderCount = orders.length;

    // 총 결제 금액 계산
    const totalPaymentAmount = orders.reduce((sum, order) => {
      return sum + order.deliveryPrice + order.Post.productPrice; // 배송비와 제품 가격 합산
    }, 0);

    // 결과 조합
    const result = {
      orderCount, // 주문 개수
      totalPaymentAmount, // 총 결제 금액
      orders: orders.map((order) => ({
        allOrderId: order.allOrderId,
        address: order.address,
        postTitle: order.Post.postTitle,
        deliveryPrice: order.deliveryPrice,
        productPrice: order.Post.productPrice,
      })),
    };

    res.status(200).json({
      message: "Order details retrieved successfully",
      orderDetails: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
