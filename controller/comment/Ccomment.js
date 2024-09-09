const session = require("express-session");
const { Comment, User } = require("../../models/index");

// 댓글 등록
exports.insertComment = async (req, res) => {
  try {
    const { postId } = req.params;

    // const { userId } = req.session.user;
    // userId는 세션에서 가져오기
    const userId = req.session?.user.userId || undefined;
    
    if(!userId){
      return res.status(403).json({ 
        error : '접속 상태가 아닙니다.',
        flag : false 
      });
    }

    const { comContent, isSecret } = req.body;
    
    const insertCom = await Comment.create({
      comContent,
      postId,
      userId,
      isSecret,
    });

    const commWithUser = await Comment.findOne({
      where: { comId: insertCom.comId },
      include: [{ model: User, attributes: ["nickname",'profileImg'] }], // User 정보 포함
    });
    // res.json({
    //   commWithUser,
    //   sessionUser: req.session.user ? req.session.user : null,
    // });

    res.json(commWithUser);
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

// 댓글 목록 보여주기
exports.getCommentList = async (req, res) =>{
  try {
      const { postId } = req.body;
      const { userId } = req.session?.user || '';

      const commnetList = await Comment.findAll({
        where:{ postId },        
          attributes: [
            "comId",
            "userId",
            "comContent",
            "isSecret",
            "createdAt",
            "isDeleted",
          ],
          include: [
            {
              model: User, // 댓글 작성자 정보
              attributes: ["userId", "nickname", "profileImg"], // 댓글 작성자 ID, 이름, 프로필 이미지
            },
            {
              model: Comment, // 대댓
              attributes: [
                "comId",
                "userId",
                "comContent",
                "isSecret",
                "createdAt",
                "isDeleted",
                "parentComId",
              ],
              as: "replies",
              include: [
                {
                  model: User, // 대댓글 작성자 정보
                  attributes: ["userId", "userName", "profileImg"], // 대댓글 작성자 ID, 이름, 프로필 이미지
                },
              ],
            },
          ],
      });

      const session = {};

      if(userId){      
          const checkSession = await User.findOne({
          where :{ userId },      
          include: [
            {
              model: Seller,
              attributes: ["sellerId"],
            },
          ],
        })

        session = {
          sellerId : checkSession.Seller?.sellerId || '',
          userId : checkSession.userId || '',
          nickname : checkSession.nickname || '',
          profileImg : checkSession.profileImg || '',
        }
      }

    res.status(200).json({ commnetList, session });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}