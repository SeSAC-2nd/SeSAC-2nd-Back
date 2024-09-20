const { Op } = require('sequelize');
const {
  User,
  Address,
  TermsAgree,
  Post,
  Seller,
  Order,
  Manager,
  sequelize,
} = require("../../models/index");
const { transporter, mailOptions } = require("../../middlewares/postman");
const { hashPw, comparePw } = require("../../utils/passwordUtils");

// 로그인
exports.userLogin = async (req, res) => {
  try {
    const { loginId, userPw } = req.body;
    // User 테이블에서 사용자 조회
    const user = await User.findOne({
      where: { loginId },
      include: [
        {
          model: Seller,
          attributes: ["sellerId"],
        },
      ],
    });
    // Manager 테이블에서 사용자 조회
    const manager = await Manager.findOne({
      where: { loginId },
      attributes: ["managerId", "managerPw"],
    });
    // User와 Manager가 모두 없으면 오류 반환
    if (!user && !manager) {
      return res
        .status(404)
        .json({ error: "아이디 또는 비밀번호를 찾을 수 없습니다." });
    }
    if (user && user.isWithdrawn) {
      return res.status(404).json({ error: "탈퇴한 계정입니다." });
    }
    let isPasswordValid = false;
    // Manager가 있으면 Manager의 비밀번호 확인 후 세션에 저장
    if (manager) {
      isPasswordValid = userPw === manager.managerPw ? true : false;
      if (isPasswordValid) {
        req.session.user = {
          managerId: manager.managerId,
        };
        // 세션 저장 후 응답
        return req.session.save(function (error) {
          if (error) {
            console.error("session error --", error);
            return res.status(500).json({ error: "Session 저장 실패" });
          }
          // 세션 저장이 성공했을 때만 응답을 보냄
          console.log("Session:", req.session); // 테스트용
          return res.send({ result: true, session: { admin: true } });
        });
      } else {
        // 비번이 일치하지 않으면
        return res
          .status(401)
          .json({ error: "아이디 또는 비밀번호를 찾을 수 없습니다." });
      }
    }
    // User가 있으면 User의 비밀번호 확인 후 세션에 저장
    if (!isPasswordValid && user) {
      isPasswordValid = comparePw(userPw, user.userPw);
      if (isPasswordValid) {
        const checkSeller = await Seller.findOne({
          where: { userId: user.userId },
          attributes: ["userId", "sellerId"],
        });
        req.session.user = {
          userId: user.userId,
          sellerId: checkSeller ? checkSeller.sellerId : null, // Seller가 있는지 확인
          isBlacklist: user.isBlacklist,
        };
        // 세션 저장 후 응답
        return req.session.save(function (error) {
          if (error) {
            console.error("session error --", error);
            return res.status(500).json({ error: "Session 저장 실패" });
          }
          console.log("Session:", req.session); // 테스트용
          // 세션 저장이 성공했을 때만 응답을 보냄
          return res.send({ result: true, session: req.session.user });
        });
      } else {
        // 비번이 일치하지 않으면
        return res
          .status(401)
          .json({ error: "아이디 또는 비밀번호를 찾을 수 없습니다." });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 회원가입
exports.userRegister = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      loginId,
      userPw,
      nickname,
      userName,
      phoneNum,
      email,
      zipCode,
      address,
      detailedAddress,
      isRequiredAgreed,
      isOptionalAgreed,
    } = req.body;

    // phoneNum 중복 확인
    const existingUserByPhoneNum = await User.findOne({
      where: { phoneNum },
      transaction: t,
      lock: t.LOCK.SHARE,
    });
    if (existingUserByPhoneNum) {
      await t.rollback();
      return res.status(409).json({ error: "이미 사용 중인 전화번호입니다." });
    }

    // email 중복 확인
    const existingUserByEmail = await User.findOne({
      where: { email },
      transaction: t,
      lock: t.LOCK.SHARE,
    });
    if (existingUserByEmail) {
      await t.rollback();
      return res.status(409).json({ error: "이미 사용 중인 이메일입니다." });
    }

    // loginId 정규표현식 검사(가능: 영어소문자/숫자, 6~12 글자)
    const loginIdRegex = /^[a-z0-9]{6,12}$/;
    if (!loginIdRegex.test(loginId)) {
      await t.rollback();
      return res.status(400).json({ error: "유효하지 않은 로그인 ID입니다." });
    }

    // userPw 정규표현식 검사(필수: 영어/숫자, 가능: 특수문자, 8~16 글자)
    const userPwRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*]{8,16}$/;
    if (!userPwRegex.test(userPw)) {
      await t.rollback();
      return res.status(400).json({ error: "유효하지 않은 비밀번호입니다." });
    }

    // nickname 정규표현식 검사(가능: 한글/영어/숫자, 2~15 글자)
    const nicknameRegex = /^[가-힣a-zA-Z0-9]{2,15}$/;
    if (!nicknameRegex.test(nickname)) {
      await t.rollback();
      return res.status(400).json({ error: "유효하지 않은 닉네임입니다." });
    }

    // userName 정규표현식 검사(필수: 한글, 2~6 글자)
    const userNameRegex = /^[가-힣]{2,6}$/;
    if (!userNameRegex.test(userName)) {
      await t.rollback();
      return res.status(400).json({ error: "유효하지 않은 이름입니다." });
    }

    // email 정규표현식 검사(필수: @ 기호, '.' 포함 후 2글자 이상)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      await t.rollback();
      return res.status(400).json({ error: "유효하지 않은 이메일입니다." });
    }

    // 비밀번호 해싱
    const hashedPw = hashPw(userPw);

    const balance = generateRandomNumber(50000, 500000);

    // 새로운 유저 생성
    const newUser = await User.create(
      {
        loginId,
        userPw: hashedPw,
        nickname,
        userName,
        phoneNum,
        email,
        balance,
      },
      {
        transaction: t,
        lock: t.LOCK.UPDATE,
      }
    );

    // 주소 생성
    const newAdress = await Address.create(
      {
        userId: newUser.userId,
        addName: "집",
        zipCode,
        address,
        detailedAddress,
        isDefault: true,
        receiver: userName,
        phoneNum,
      },
      {
        transaction: t,
        lock: t.LOCK.UPDATE,
      }
    );

    // 약관 동의 생성
    const newTermsAgree = await TermsAgree.create(
      {
        userId: newUser.userId,
        isRequiredAgreed,
        isOptionalAgreed,
      },
      {
        transaction: t,
        lock: t.LOCK.UPDATE,
      }
    );

    await t.commit();

    // 성공 응답 시 userPw 제외
    if (newUser && newAdress && newTermsAgree){
      const oneDayAgo = new Date(new Date() - 24 * 60 * 60 * 1000);
      const recentSignUps = await User.count({
        where: {
          createdAt: {
            [Op.gte]: oneDayAgo
          }
        }
      });
  
      if (recentSignUps < 200) {
        try {
          mailOptions.to = newUser.email;

          await transporter.sendMail(mailOptions);
          console.log('Welcome email sent successfully');
        } catch (emailError) {
          console.error('Error sending welcome email:', emailError);
        }
      }

      res.status(200).json({
        message: "사용자가 성공적으로 회원가입되었습니다.",
        user: (({ userPw, ...userWithoutPw }) => userWithoutPw)(
          newUser.toJSON()
        ),
        adress: newAdress.toJSON(),
        termsAgree: newTermsAgree.toJSON(),
      });
    }
    else res.status(500).json({ result: false, error: "회원가입 실패" });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 로그인 아이디 중복 체크
exports.checkDuplicatedLoginid = async (req, res) => {
  try {
    const { loginId } = req.body;

    // loginId이 제공되지 않았거나 잘못된 경우 처리
    if (!loginId) {
      return res.status(400).json({ error: "로그인 ID가 필요합니다." });
    }

    // Manager 테이블에서 사용자 조회
    const manager = await Manager.findOne({
      where: { loginId },
      attributes: ["loginId"],
    });

    if (loginId == manager?.loginId) {
      return res.status(400).json({ error: "이미 사용 중인 로그인 ID입니다." });
    }

    // 로그인 아이디 중복 확인
    const existingUser = await User.findOne({ where: { loginId } });
    if (existingUser) {
      // 아이디가 중복된 경우
      return res
        .status(409)
        .json({ message: "이미 사용 중인 로그인 ID입니다." });
    } else {
      // 아이디가 중복되지 않은 경우
      return res.status(200).json({ message: "사용 가능한 로그인 ID입니다." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 로그인 닉네임 중복 체크
exports.checkDuplicatedNickname = async (req, res) => {
  try {
    const { nickname } = req.body;

    // nickname이 제공되지 않았거나 잘못된 경우 처리
    if (!nickname) {
      return res.status(400).json({ error: "닉네임이 필요합니다." });
    }

    // 로그인 닉네임 중복 확인
    const existingUser = await User.findOne({ where: { nickname } });
    if (existingUser) {
      // 닉네임이 중복된 경우
      return res.status(409).json({ message: "이미 사용 중인 닉네임입니다." });
    } else {
      // 닉네임이 중복되지 않은 경우
      return res.status(200).json({ message: "사용 가능한 닉네임입니다." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 비밀번호 일치 확인 - 회원 탈퇴 시
exports.checkPassword = async (req, res) => {
  try {
    const { userId } = req.session.user;
    const { userPw } = req.body;

    // userId, userPw가 제공되지 않았거나 잘못된 경우 처리
    if (!userId || !userPw) {
      return res
        .status(400)
        .json({ error: "사용자 ID와 비밀번호가 필요합니다." });
    }

    // 사용자 조회
    const user = await User.findOne({ where: { userId } });

    // DB user 모델을 가져오지 못할 경우 처리
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    // 비밀번호 비교
    const isPasswordValid = comparePw(userPw, user.userPw);

    if (isPasswordValid) {
      // 비밀번호가 일치한 경우
      return res
        .status(200)
        .json({ message: "비밀번호가 일치합니다.", flag: "" });
    } else {
      // 비밀번호가 일치하지 않은 경우
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 회원 정보 수정
// 이미지 추가해야 함
exports.updateUser = async (req, res) => {
  try {
    let msg = "";

    const { userId } = req.session.user;

    // 사용자 조회
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }
    let nickname = req.body.nickname || user.nickname;
    let userName = req.body.userName || user.userName;
    let userPw = req.body.userPw || undefined;
    let phoneNum = req.body.phoneNum || user.phoneNum;
    let email = req.body.email || user.email;
    let zipCode = req.body.zipCode || user.zipCode;
    let address = req.body.address || user.address;
    let detailedAddress = req.body.detailedAddress || user.detailedAddress;

    const checkNick = await User.findOne({
      where: {
        nickname: nickname,
      },
    });

    if (checkNick && checkNick.userId !== userId) {
      return res.status(201).json({ error: "이미 사용중인 닉네임입니다." });
    }

    // 새 비밀번호가 제공된 경우에만 기존 비밀번호와 비교
    let updatedData = {};
    if (userPw) {
      const isSamePassword = comparePw(userPw, user.userPw);
      if (isSamePassword) {
        msg = "기존의 비밀번호와 동일합니다.";
      }
      // 비밀번호 해싱
      updatedData.userPw = hashPw(userPw);
    } else {
      updatedData.userPw = user.userPw;
    }

    // 닉네임과 이메일도 업데이트 데이터에 추가
    if (userName) updatedData.userName = userName;
    if (nickname) updatedData.nickname = nickname;
    if (email) updatedData.email = email;
    if (req.file) updatedData.profileImg = req.file.location;
    if (phoneNum) updatedData.phoneNum = phoneNum;
    if (zipCode) updatedData.zipCode = zipCode;
    if (address) updatedData.address = address;
    if (detailedAddress) updatedData.detailedAddress = detailedAddress;

    // 데이터 업데이트
    await user.update(updatedData, { where: { userId } });
    await Address.update(updatedData, { where: { userId, isDefault: true } });

    // 성공 응답 시 userPw 제외
    const updatedUser = { ...user.toJSON() };
    delete updatedUser.userPw; // 비밀번호는 응답에서 제외

    // 수정된 정보를 세션에도 저장
    req.session.user = {
      ...req.session.user,
      nickname: updatedUser.nickname,
      email: updatedUser.email,
    };

    // 세션 저장 후 응답
    req.session.save((err) => {
      if (err) {
        console.error("세션 저장 오류:", err);
        return res
          .status(500)
          .json({ error: "세션 저장 중 오류가 발생했습니다." });
      }
      res.status(200).json({
        message: "사용자 정보가 성공적으로 업데이트되었습니다.",
        msg,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 회원 조회
exports.getUser = async (req, res) => {
  try {
    const { userId } = req.session.user;

    // userId가 제공되지 않았거나 잘못된 경우 처리
    if (!userId) {
      return res.status(400).json({ error: "사용자 ID가 필요합니다." });
    }

    // 사용자 조회
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    // 성공 응답
    res.status(200).json({ user: (({ userPw, ...rest }) => rest)(user) });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 회원 탈퇴
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.session.user;

    // userId가 제공되지 않았거나 잘못된 경우 처리
    if (!userId) {
      return res.status(400).json({ error: "사용자 ID가 필요합니다." });
    }

    // 사용자 조회
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    // 사용자의 판매자 정보 조회
    const seller = await Seller.findOne({ where: { userId } });

    // 판매자가 존재하면 판매글 조회
    if (seller) {
      const posts = await Post.findAll({
        where: { sellerId: seller.sellerId },
      });

      // 판매 중인 판매글이 있는지 확인
      const hasActivePosts = posts.some(
        (post) => post.sellStatus === "판매 중"
      );
      if (hasActivePosts) {
        return res
          .status(400)
          .json({ error: "판매 중인 판매글이 있어 탈퇴할 수 없습니다." });
      }
    }

    // 사용자의 구매 정보 조회
    const orders = await Order.findAll({ where: { userId } });

    // 구매 확정 여부가 false인 주문이 있는지 확인
    const hasPendingOrders = orders.some((order) => !order.isConfirmed);
    if (hasPendingOrders) {
      return res
        .status(400)
        .json({ error: "확정되지 않은 구매가 있어 탈퇴할 수 없습니다." });
    }

    // 이미 탈퇴 처리된 사용자인지 확인
    if (user.isWithdrawn) {
      return res.status(400).json({ error: "이미 탈퇴 처리된 사용자입니다." });
    }

    // 사용자 상태를 탈퇴로 변경
    await user.update({ isWithdrawn: true });

    // 성공 응답
    res
      .status(200)
      .json({ message: "사용자가 성공적으로 탈퇴 처리되었습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 로그아웃
exports.userLogout = async (req, res) => {
  try {
    // 세션 삭제
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("로그아웃에 실패했습니다.");
      }
      // 세션 삭제 후 쿠키도 명시적으로 삭제
      res.clearCookie("connect.sid"); // 세션 쿠키 이름이 'connect.sid'인 경우

      // 로그아웃 성공 응답
      res.status(200).json({ message: "성공적으로 로그아웃되었습니다." });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
