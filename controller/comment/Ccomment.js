const { Comment, User } = require("../../models/index");

// 댓글 등록
exports.insertComment = async (req, res) => {
  try {
    const { postId } = req.params;

    //   const { userId } = req.session.user;
    // userId는 세션에서 가져오기
    const { comContent, isSecret, userId } = req.body;
    const insertCom = await Comment.create({
      comContent,
      postId,
      userId,
      isSecret,
    });
    // const commWithUser = await Comment.findOne({
    //   where: { comId: insertCom.comId },
    //   include: [{ model: User, attributes: ["userNick"] }], // User 정보 포함
    // });
    // res.json({
    //   commWithUser,
    //   sessionUser: req.session.user ? req.session.user : null,
    // });
    res.json(insertCom);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 댓글, 대댓글 수정
exports.updateComment = async (req, res) => {
  try {
    const { comId } = req.params;
    const { comContent, isSecret } = req.body;
    const comment = await Comment.findByPk(comId);
    if (!comment) {
      return res.status(404).json({ error: "댓글을 찾을 수 없습니다." });
    }
    // 댓글 업데이트
    const [updatedRows] = await Comment.update(
      { comContent, isSecret },
      { where: { comId } }
    );
    // 업데이트 성공 여부 확인
    if (updatedRows === 1) {
      // 업데이트 성공
      const updatedComment = await Comment.findByPk(comId);
      res.json({ updatedComment }); // 업데이트된 댓글을 응답으로 보냄
    } else {
      // 업데이트 실패
      res.status(404).json({ error: "댓글을 찾을 수 없습니다." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 댓글 삭제
//   대댓글 삭제는 할지 안할지 좀 더 고민
exports.deleteComment = async (req, res) => {
  try {
    // if (req.session.user) {
    const { comId } = req.params;
    const deleteComm = await Comment.update(
      { isDeleted: true }, // 논리적 삭제
      {
        where: {
          // 상위 댓글 업데이트
          comId,
        },
      }
    );
    // 댓글이 성공적으로 삭제되었는지 확인
    if (deleteComm[0] === 0) {
      return res.status(404).json({ error: "댓글을 찾을 수 없습니다." });
    }
    const deleteReply = await Comment.update(
      { isDeleted: true }, // 논리적 삭제
      {
        where: {
          // 해당 댓글의 대댓글까지 업데이트
          parentComId: comId,
        },
      }
    );
    res.json({ deleteComm: deleteComm[0], deleteReply: deleteReply[0] });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
// 대댓글 삭제
exports.deleteCommentReply = async (req, res) => {
  try {
    const { comId } = req.params;
    const deleteComm = await Comment.update(
      { isDeleted: true },
      {
        where: {
          // 해당 대댓글 업데이트
          comId,
        },
      }
    );
    if (deleteComm[0] === 0) {
      return res.status(404).json({ error: "대댓글을 찾을 수 없습니다." });
    }
    res.json({ deleted: deleteComm[0] });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
// 대댓글 등록
exports.insertReply = async (req, res) => {
  try {
    const { comId } = req.params;
    //   const { userId } = req.session.user;
    const { postId, comContent, isSecret, userId } = req.body;
    const insertReply = await Comment.create({
      comContent,
      postId,
      userId,
      parentComId: comId,
      isSecret,
    });
    // 생성된 대댓글의 User 정보를 가져오기
    // const replyWithUser = await Comment.findOne({
    //   where: { comId: insertReply.comId },
    //   include: [{ model: User, attributes: ["userNick"] }], // User 정보 포함
    // });
    // res.json({ replyWithUser, sessionUser: req.session.user });
    res.json(insertReply);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
