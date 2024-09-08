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
    const userCount = await User.count();
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
    res.json({ allUser, userCount });
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
          attributes: ["postTitle", "postContent"],
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
      attributes: ["orderLogId", "deposit", "withdraw", "createdAt"],
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
    const blacklist = await User.update(
      { isBlacklist: true },
      {
        where: {
          userId,
        },
      }
    );
    if (blacklist[0] !== 1) return res.send({ result: false });
    res.send({ result: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
