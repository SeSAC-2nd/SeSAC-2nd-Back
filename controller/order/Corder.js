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
} = require("../../models/index");

// 결제 페이지(주문서) 이동
exports.getOrderPage = async (req, res) => {
  try {
    // userId는 session에서 추출
    // cartIds는 배열로 받기
    const { userId, cartIds } = req.body;
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
  try {
    // postId, sellerId, cartId, deliveryPrice(판매자별 한번만 배송비 추가)
    // order테이블에 insert
    // 주문번호는 front에서 넘겨줄지 back에서 생성할지 논의 필요
    // 결제금액만큼 사용자의 잔고 차감
    // 해당 판매글의 판매 상태가 '판매 예약'으로 변경, 장바구니에서 해당 판매글이 삭제됨(cartId로 삭제)
    // 중개 내역 테이블에 해당 판매글에 대한 정보 insert
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// async function createOrder(orderData) {
//     const { userInfo, postInfo, addressInfo } = orderData;

//     // 모든 주문에 공통으로 적용될 orderId를 생성
//     const allOrderId = generateUniqueOrderId(); // 이 함수는 고유한 주문 ID를 생성

//     for (const post of postInfo) {
//         const { postId, Post } = post;
//         const { sellerId, Seller } = Post;
//         const { deliveryFee } = Seller.Delivery;

//         try {
//             await Order.create({
//                 userId: getUserId(userInfo.email), // 이메일로 userId 가져오기 (가정)
//                 postId: postId,
//                 sellerId: sellerId,
//                 allOrderId: allOrderId,
//                 createdAt: new Date(),
//                 deliveryStatus: 'Pending', // 초기 배송 상태
//                 address: `${addressInfo.address} ${addressInfo.detailedAddress || ''}`,
//                 deliveryPrice: deliveryFee,
//                 invoiceNumber: null, // 주문 시점에서는 송장번호가 없으므로 null
//                 isConfirmed: false,
//                 isOrderCanceled: false,
//             });
//         } catch (error) {
//             console.error('Order creation failed:', error);
//             // 오류 처리 (예: 트랜잭션 롤백 또는 재시도)
//         }
//     }
// }

// // 고유한 주문 ID를 생성하는 함수 (예시)
// function generateUniqueOrderId() {
//     return 'ORD' + Math.floor(Math.random() * 1000000000); // 간단한 고유 ID 생성 방법
// }

// 결제 완료 페이지 이동
// 결제 총액도 출력하려하는데 어떻게 할지 고민 중
exports.getOrderCompletePage = async (req, res) => {
  try {
    const { allOrderId } = req.body;
    const order = await Order.findAll({
      where: { allOrderId },
      attributes: ["allOrderId", "address"],
    });
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
