const { Complaint } = require("../../models/index");

// 신고 등록
exports.insertComplaint = async (req, res) => {
  try {
    // userId 는 session 에서 추출
    const { userId, postId, sellerId, complaintContent } = req.body;
    const newComplaint = await Complaint.create({
      userId,
      postId,
      sellerId,
      complaintContent,
    });
    res.json(newComplaint);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
