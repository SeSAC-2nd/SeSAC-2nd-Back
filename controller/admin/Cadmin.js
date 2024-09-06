const { User, Seller, Complaint, TermsAgree } = require("../../models/index");

// 전체회원조회 페이지 이동
exports.getAllUserPage = async (req, res) => {
  try {
    const allUser = await User.findAll({
      attributes: ["loginId", "nickname"],
      include: [
        {
          model: TermsAgree,
          attributes: ["isRequiredAgreed", "isOptionalAgreed"],
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
    const allSeller = await Seller.findAll({
      attributes: ["sellerName", ""],
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 신고글조회 페이지 이동
exports.getComplaintPage = async (req, res) => {
  try {
    const {} = req.body;
    const complaintList = await Complaint.findAll({});
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 블랙리스트 관리 페이지 이동
exports.getBlacklistPage = async (req, res) => {
  try {
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 거래내역조회 페이지 이동
exports.getOrderLogsPage = async (req, res) => {
  try {
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
