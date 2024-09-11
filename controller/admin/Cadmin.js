const {
  User,
  Seller,
  Complaint,
  TermsAgree,
  Post,
  OrderLogs,
  Order,
  sequelize,
} = require("../../models/index");

// 전체회원조회 페이지 이동
exports.getAllUserPage = async (req, res) => {
  try {
    const allUser = await User.findAll({
      attributes: ["userId", "loginId", "nickname"],
      where: { isWithdrawn: false, isBlacklist: false },
      include: [
        {
          model: TermsAgree,
          attributes: ["isRequiredAgreed", "isOptionalAgreed"],
        },
        {
          model: Seller,
          attributes: ["sellerId", "sellerName"],
        },
      ],
    });
    res.json(allUser);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 판매자조회 페이지 이동
exports.getSellerPage = async (req, res) => {
  try {
    const query = `
      SELECT 
        Seller.sellerName, 
        Seller.sellerId, 
        COUNT(Complaint.complaintId) AS complaintCount, 
        User.userId, 
        User.loginId,
        User.isBlacklist
      FROM Seller AS Seller 
      INNER JOIN User AS User ON Seller.userId = User.userId AND User.isBlacklist = false 
      LEFT OUTER JOIN Complaint AS Complaint ON Seller.sellerId = Complaint.sellerId 
      GROUP BY Seller.sellerId 
      ORDER BY complaintCount DESC;
    `;
    const [allSeller] = await sequelize.query(query);
    res.json(allSeller);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 신고글조회 페이지 이동
exports.getComplaintPage = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const complaintList = await Complaint.findAll({
      where: { sellerId },
      attributes: ["complaintContent"],
      include: [
        {
          model: Seller,
          attributes: ["sellerName", "sellerId"],
        },
        {
          model: Post,
          attributes: ["postId", "postTitle", "postContent"],
        },
      ],
    });
    res.json(complaintList);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 블랙리스트 관리 페이지 이동
exports.getBlacklistPage = async (req, res) => {
  try {
    const query = `
      SELECT 
        User.userId, 
        User.loginId, 
        Seller.sellerId, 
        Seller.sellerName, 
        COUNT(Complaint.complaintId) AS complaintCount 
      FROM User
      LEFT OUTER JOIN Seller ON User.userId = Seller.userId 
      LEFT OUTER JOIN Complaint ON Seller.sellerId = Complaint.sellerId 
      WHERE User.isBlacklist = true;
    `;
    const [blacklist] = await sequelize.query(query);
    res.json(blacklist);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 거래내역조회 페이지 이동
exports.getOrderLogsPage = async (req, res) => {
  try {
    const orderLogList = await OrderLogs.findAll({
      attributes: [
        "orderLogId",
        "deposit",
        "withdraw",
        "createdAt",
        "logStatus",
      ],
      include: [
        {
          model: Order,
          attributes: ["orderId", "userId", "postId", "sellerId"],
          include: [
            {
              model: User,
              attributes: ["nickName"],
            },
            {
              model: Post,
              attributes: ["postId", "postTitle"],
              include: [
                {
                  model: Seller,
                  attributes: ["sellerName"],
                },
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(orderLogList);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 블랙리스트 추가
exports.updateBlacklist = async (req, res) => {
  try {
    const { userId } = req.body;

    // 판매자 조회
    const seller = await Seller.findOne({
      where: { userId },
      attributes: ["sellerId", "userId"],
    });

    // 블랙리스트 여부 true
    const blacklist = await User.update(
      { isBlacklist: true },
      {
        where: {
          userId,
        },
      }
    );

    // 판매중인 판매글은 삭제 처리
    const sellingPost = await Post.update(
      { isDeleted: true },
      { where: { isOrdered: false, sellerId: seller.sellerId } }
    );

    // 판매 예약(배송 전)인 판매글은 구매자에게 환불 처리(중개 내역 테이블의 내역 상태 컬럼이 '환불'로 추가)
    const beforeSelling = await Order.findAll({
      where: { sellerId: seller.sellerId, deliveryStatus: "배송 전" },
      attributes: ["orderId", "userId", "postId"],
    });

    if (beforeSelling.length > 0) {
      for (const order of beforeSelling) {
        const findOrderLog = await OrderLogs.findOne({
          where: { orderId: order.orderId },
          attributes: ["orderLogPrice"],
          limit: 1,
        });

        if (findOrderLog) {
          // 중개 내역에 환불 추가
          await OrderLogs.create({
            managerId: 1,
            orderId: order.orderId,
            userId: order.userId,
            postId: order.postId,
            orderLogPrice: findOrderLog.orderLogPrice,
            deposit: null,
            withdraw: findOrderLog.orderLogPrice,
            logStatus: "환불",
            createdAt: new Date(),
          });

          const user = await User.findOne({
            where: { userId: order.userId },
            attributes: ["balance"],
          });

          // 환불 금액 구매자 잔고에 환불
          await User.update(
            { balance: user.balance + findOrderLog.orderLogPrice },
            { where: { userId: order.userId } }
          );
        }
      }
    }

    if (blacklist[0] !== 1) return res.send({ result: false });
    res.send({ result: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
