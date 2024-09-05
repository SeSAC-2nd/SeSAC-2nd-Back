const { User, Address, TermsAgree, Post, Seller, Order, Manager } = require('../../models/index');
const { hashPw, comparePw } = require('../../utils/passwordUtils');

// 로그인
exports.userLogin = async (req, res) => {
  try {
    const { loginId, userPw } = req.body;

    // User 테이블에서 사용자 조회
    const user = await User.findOne({
      where: { loginId },
      include: [{
        model: Seller,
        attributes: ['sellerId'],
      }]
    });

    // Manager 테이블에서 사용자 조회
    const manager = await Manager.findOne({
      where: { loginId },
      attributes: ['managerId']
    });

    // User와 Manager가 모두 없으면 오류 반환
    if (!user && !manager) {
      return res.status(404).json({ error: '아이디 또는 비밀번호를 찾을 수 없습니다.' });
    }

    if (user.dataValues.isWithdrawn) {
      return res.status(404).json({ error: '탈퇴한 계정입니다.' });
    }

    let isPasswordValid = false;

    // Manager가 있으면 Manager의 비밀번호 확인
    if (manager) {
      isPasswordValid = comparePw(userPw, manager.managerPw);
      if (isPasswordValid) {
        req.session.user = {
          managerId: manager.dataValues.managerId,
        };
      }
    }

    // User가 있으면 User의 비밀번호 확인
    if (!isPasswordValid && user) {
      isPasswordValid = comparePw(userPw, user.userPw);
      if (isPasswordValid) {
        req.session.user = {
          userId: user.dataValues.userId,
          profileImg: user.dataValues.profileImg || null, // 프로필 이미지 없으면 null
          nickname: user.dataValues.nickname,
          sellerId: user.Seller ? user.Seller.sellerId : null, // Seller가 있는지 확인
        };
      }
    }

    // 비밀번호가 유효하지 않으면 오류 반환
    if (!isPasswordValid) {
      return res.status(401).json({ error: '아이디 또는 비밀번호를 찾을 수 없습니다.' });
    }

    // 세션 저장 후 응답
    req.session.save(function (error) {
      if (error) {
        console.error('session error --', error);
        return res.status(500).json({ error: 'Session 저장 실패' });
      } else {
        // 세션 저장이 성공했을 때만 응답을 보냄
        res.send({ result: true });
      }
    });

    console.log('Session:', req.session); // 테스트용
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


// 회원가입
exports.userRegister = async (req, res) => {
  try {
    const {
      loginId, userPw, nickname, userName, phoneNum, email, balance,
      addName, zipCode, address, detailedAdress, isDefault,
      isRequiredAgreed, isOptionalAgreed
    } = req.body;

    console.log("User Model:", User);

    // phoneNum 중복 확인
    const existingUserByPhoneNum = await User.findOne({ where: { phoneNum } });
    if (existingUserByPhoneNum) {
      return res.status(409).json({ error: '이미 사용 중인 전화번호입니다.' });
    }

    // email 중복 확인
    const existingUserByEmail = await User.findOne({ where: { email } });
    if (existingUserByEmail) {
      return res.status(409).json({ error: '이미 사용 중인 이메일입니다.' });
    }

    // loginId 정규표현식 검사(가능: 영어소문자/숫자, 6~12 글자)
    const loginIdRegex = /^[a-z0-9]{6,12}$/;
    if (!loginIdRegex.test(loginId))
      return res.status(400).json({ error: '유효하지 않은 로그인 ID입니다.' });

    // userPw 정규표현식 검사(필수: 영어/숫자, 가능: 특수문자, 8~16 글자)
    const userPwRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*]{8,16}$/;
    if (!userPwRegex.test(userPw))
      return res.status(400).json({ error: '유효하지 않은 비밀번호입니다.' });

    // nickname 정규표현식 검사(가능: 한글/영어/숫자, 2~15 글자)
    const nicknameRegex = /^[가-힣a-zA-Z0-9]{2,15}$/;
    if (!nicknameRegex.test(nickname))
      return res.status(400).json({ error: '유효하지 않은 닉네임입니다.' });

    // userName 정규표현식 검사(필수: 한글, 2~6 글자)
    const userNameRegex = /^[가-힣]{2,6}$/;
    if (!userNameRegex.test(userName))
      return res.status(400).json({ error: '유효하지 않은 이름입니다.' });

    // email 정규표현식 검사(필수: @ 기호, '.' 포함 후 2글자 이상)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ error: '유효하지 않은 이메일입니다.' });

    // 비밀번호 해싱
    const hashedPw = hashPw(userPw);

    // 새로운 유저 생성
    const newUser = await User.create({
      loginId,
      userPw: hashedPw,
      nickname,
      userName,
      phoneNum,
      email,
      balance,
    });

    // 주소 생성
    const newAdress = await Address.create({
      userId: newUser.userId,
      addName,
      zipCode,
      address,
      detailedAdress,
      isDefault: isDefault || true,
      receiver: userName,
      phoneNum,
    });

    // 약관 동의 생성
    const newTermsAgree = await TermsAgree.create({
      userId: newUser.userId,
      isRequiredAgreed,
      isOptionalAgreed,
    });

    // 성공 응답 시 userPw 제외
    if (newUser && newAdress && newTermsAgree) res.status(200).json({
      message: '사용자가 성공적으로 회원가입되었습니다.',
      user: (({ userPw, ...userWithoutPw }) => userWithoutPw)(newUser.toJSON()),
      adress: newAdress.toJSON(),
      termsAgree: newTermsAgree.toJSON()
    });
    else res.status(500).json({ result: false, error: '회원가입 실패' });

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


// 로그인 아이디 중복 체크
exports.checkDuplicatedLoginid = async (req, res) => {
  try {
    const { loginId } = req.body;

    // loginId이 제공되지 않았거나 잘못된 경우 처리
    if (!loginId) {
      return res.status(400).json({ error: '로그인 ID가 필요합니다.' });
    }

    // Manager 테이블에서 사용자 조회
    const manager = await Manager.findOne({
      where: { loginId },
      attributes: ['loginId']
    });

    if (loginId == manager.dataValues.loginId) {
      return res.status(400).json({ error: '이미 사용 중인 로그인 ID입니다.' });
    }

    // 로그인 아이디 중복 확인
    const existingUser = await User.findOne({ where: { loginId } });
    if (existingUser) {
      // 아이디가 중복된 경우
      return res.status(409).json({ message: '이미 사용 중인 로그인 ID입니다.' });
    } else {
      // 아이디가 중복되지 않은 경우
      return res.status(200).json({ message: '사용 가능한 로그인 ID입니다.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

// 로그인 닉네임 중복 체크
exports.checkDuplicatedNickname = async (req, res) => {
  try {
    const { nickname } = req.body;

    // nickname이 제공되지 않았거나 잘못된 경우 처리
    if (!nickname) {
      return res.status(400).json({ error: '닉네임이 필요합니다.' });
    }

    // 로그인 닉네임 중복 확인
    const existingUser = await User.findOne({ where: { nickname } });
    if (existingUser) {
      // 닉네임이 중복된 경우
      return res.status(409).json({ message: '이미 사용 중인 닉네임입니다.' });
    } else {
      // 닉네임이 중복되지 않은 경우
      return res.status(200).json({ message: '사용 가능한 닉네임입니다.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

// 비밀번호 일치 확인 - 회원 탈퇴 시
exports.checkPassword = async (req, res) => {
  try {
    const { userId } = req.session.user;
    const { userPw } = req.body;

    // userId, userPw가 제공되지 않았거나 잘못된 경우 처리
    if (!userId || !userPw) {
      return res.status(400).json({ error: '사용자 ID와 비밀번호가 필요합니다.' });
    }

    // 사용자 조회
    const user = await User.findOne({ where: { userId } });

    // DB user 모델을 가져오지 못할 경우 처리
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // 비밀번호 비교
    const isPasswordValid = comparePw(userPw, user.userPw);

    if (isPasswordValid) {
      // 비밀번호가 일치한 경우
      return res.status(200).json({ message: '비밀번호가 일치합니다.' });
    } else {
      // 비밀번호가 일치하지 않은 경우
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

// 회원 정보 수정
// 이미지 추가해야 함
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.session.user;
    const { userPw, nickname, email } = req.body;

    // userId가 세션에 없을 경우
    if (!userId) {
      return res.status(400).json({ error: '사용자 ID가 필요합니다.' });
    }

    // 사용자 조회
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // 새 비밀번호가 제공된 경우에만 기존 비밀번호와 비교
    let updatedData = {};
    if (userPw) {
      const isSamePassword = comparePw(userPw, user.userPw);
      if (isSamePassword) {
        return res.status(409).json({ error: '기존 비밀번호와 새 비밀번호가 동일합니다.' });
      }

      // 비밀번호 해싱
      updatedData.userPw = hashPw(userPw);
    }

    // 닉네임과 이메일도 업데이트 데이터에 추가
    if (nickname) updatedData.nickname = nickname;
    if (email) updatedData.email = email;

    // 데이터 업데이트
    await user.update(updatedData);

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
        console.error('세션 저장 오류:', err);
        return res.status(500).json({ error: '세션 저장 중 오류가 발생했습니다.' });
      }
      res.status(200).json({ message: '사용자 정보가 성공적으로 업데이트되었습니다.', updatedUser });
    });

    console.log(req.session);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

// 회원 조회
exports.getUser = async (req, res) => {
  console.log("req >>>>> ", req.session);
  try {
    const { userId } = req.session.user;

    // userId가 제공되지 않았거나 잘못된 경우 처리
    if (!userId) {
      return res.status(400).json({ error: '사용자 ID가 필요합니다.' });
    }

    // 사용자 조회
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // 성공 응답
    res.status(200).json({ user: (({ userPw, ...rest }) => rest)(user.dataValues) });

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

// 회원 탈퇴
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.session.user;

    // userId가 제공되지 않았거나 잘못된 경우 처리
    if (!userId) {
      return res.status(400).json({ error: '사용자 ID가 필요합니다.' });
    }

    // 사용자 조회
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }


    // 사용자의 판매자 정보 조회
    const seller = await Seller.findOne({ where: { userId } });
    console.log(seller);

    // 판매자가 존재하면 판매글 조회
    if (seller) {
      const posts = await Post.findAll({ where: { sellerId: seller.dataValues.sellerId } });

      // 판매 중인 판매글이 있는지 확인
      const hasActivePosts = posts.some(post => post.sellStatus === "판매 중");
      if (hasActivePosts) {
        return res.status(400).json({ error: '판매 중인 판매글이 있어 탈퇴할 수 없습니다.' });
      }
    }

    // 사용자의 구매 정보 조회
    const orders = await Order.findAll({ where: { userId } });

    // 구매 확정 여부가 false인 주문이 있는지 확인
    const hasPendingOrders = orders.some(order => !order.isConfirmed);
    if (hasPendingOrders) {
      return res.status(400).json({ error: '확정되지 않은 구매가 있어 탈퇴할 수 없습니다.' });
    }


    // 이미 탈퇴 처리된 사용자인지 확인
    if (user.isWithdrawn) {
      return res.status(400).json({ error: '이미 탈퇴 처리된 사용자입니다.' });
    }

    // 사용자 상태를 탈퇴로 변경
    await user.update({ isWithdrawn: true });

    // 성공 응답
    res.status(200).json({ message: '사용자가 성공적으로 탈퇴 처리되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

// 로그아웃
exports.userLogout = async (req, res) => {
  console.log(req.session);
  try {
    // 세션 삭제
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send('로그아웃에 실패했습니다.');
      }
      // 세션 삭제 후 쿠키도 명시적으로 삭제
      res.clearCookie('connect.sid'); // 세션 쿠키 이름이 'connect.sid'인 경우

      // 로그아웃 성공 응답
      res.status(200).json({ message: '성공적으로 로그아웃되었습니다.' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};
