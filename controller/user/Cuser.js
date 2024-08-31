const { User, Address, TermsAgree } = require('../../models/index');
const { hashPw, comparePw } = require('../../utils/passwordUtils');

// 로그인
exports.userLogin = async (req, res) => {
  try {
    const { loginId, userPw } = req.body;

    const user = await User.findOne({
      where: { loginId },
    });

    if (!user) return res.status(404).json({ error: 'User not found.' });

    // 데이터베이스에 저장된 해시된 비밀번호와 입력된 비밀번호를 비교
    const isPasswordValid = comparePw(userPw, user.userPw);

    if (!isPasswordValid)
      return res.status(401).json({ error: 'Invalid password.' });
    else res.send({ result: true });
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
      addName, zipCode, address, detailedAdress,
      isRequiredAgreed, isOptionalAgreed
    } = req.body;

    console.log("User Model:", User);

    // loginId 정규표현식 검사(가능: 영어소문자/숫자, 2~15 글자)
    // 너무 짧아서 임의로 늘림 - 상의 필요
    const loginIdRegex = /^[a-z0-9]{2,15}$/;
    if (!loginIdRegex.test(loginId))
      return res.status(400).json({ error: `Invalid loginId. ${loginId}` });

    // userPw 정규표현식 검사(필수: 영어/숫자, 가능: 특수문자, 8~16 글자)
    const userPwRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*]{8,16}$/;
    if (!userPwRegex.test(userPw))
      return res.status(400).json({ error: 'Invalid userPw.' });

    // nickname 정규표현식 검사(가능: 한글/영어/숫자, 2~15 글자)
    const nicknameRegex = /^[가-힣a-zA-Z0-9]{2,15}$/;
    if (!nicknameRegex.test(nickname))
      return res.status(400).json({ error: 'Invalid nickname.' });

    // userName 정규표현식 검사(필수: 한글, 2~6 글자)
    const userNameRegex = /^[가-힣]{2,6}$/;
    if (!userNameRegex.test(userName))
      return res.status(400).json({ error: 'Invalid userName.' });

    // email 정규표현식 검사(필수: @ 기호, '.' 포함 후 2글자 이상)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ error: 'Invalid email.' });

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
    });

    // 약관 동의 생성
    const newTermsAgree = await TermsAgree.create({
      userId: newUser.userId,
      isRequiredAgreed,
      isOptionalAgreed,
    });

    if (newUser && newAdress && newTermsAgree) res.send({ result: true });
    else res.send({ result: false });

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


// 로그인 아이디 중복 체크
exports.checkDuplicatedLoginid = async (req, res) => {
  try {
    const { loginId } = req.body;

    if (!loginId) {
      return res.status(400).json({ error: 'Login ID is required.' });
    }

    const loginIdRegex = /^[a-z0-9]{2,15}$/;
    if (!loginIdRegex.test(loginId)) {
      return res.status(400).json({ error: 'Invalid login ID format.' });
    }

    // 로그인 아이디 중복 확인
    const existingUser = await User.findOne({ where: { loginId } });
    if (existingUser) {
      // 아이디가 중복된 경우
      return res.status(409).json({ message: 'Login ID is already in use.' });
    } else {
      // 아이디가 중복되지 않은 경우
      return res.status(200).json({ message: 'Login ID is available.' });
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

    if (!nickname) {
      return res.status(400).json({ error: 'Nickname is required.' });
    }
    const nicknameRegex = /^[가-힣a-zA-Z0-9]{2,15}$/;
    if (!nicknameRegex.test(nickname))
      return res.status(400).json({ error: 'Invalid nickname format.' });

    // 로그인 닉네임 중복 확인
    const existingUser = await User.findOne({ where: { nickname } });
    if (existingUser) {
      // 닉네임이 중복된 경우
      return res.status(409).json({ message: 'Nickname is already in use.' });
    } else {
      // 닉네임이 중복되지 않은 경우
      return res.status(200).json({ message: 'Nickname is available.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

// 비밀번호 일치 확인
// 헷갈리는 점 - 회원 가입 시?
// 아이디 없이 찾아도 되는 건지? - 상의 필요
exports.checkPassword = async (req, res) => {
  try {
    const { userId, userPw } = req.body;

    if (!userId || !userPw) {
      return res.status(400).json({ error: 'User ID and password are required.' });
    }

    // 사용자 조회
    const user = await User.findOne({ where: { userId } });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // 비밀번호 비교
    const isPasswordValid = comparePw(userPw, user.userPw);

    if (isPasswordValid) {
      // 비밀번호가 일치한 경우
      return res.status(200).json({ message: 'Password is correct.' });
    } else {
      // 비밀번호가 일치하지 않은 경우
      return res.status(401).json({ message: 'Incorrect password.' });
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
    const { userId } = req.params;
    const { userPw, nickname, email } = req.body;

    // userId가 제공되지 않았거나 잘못된 경우 처리
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    // 사용자 조회
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // 비밀번호 해싱
    const hashedPw = userPw ? hashPw(userPw) : user.userPw;

    const updatedData = {
      userPw: hashedPw,
      nickname: nickname || user.nickname,
      email: email || user.email,
    };

    // 데이터 업데이트
    await user.update(updatedData);

    // 성공 응답
    res.status(200).json({ message: 'User information updated successfully.', user: { ...user.toJSON(), ...updatedData } });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

// 회원 조회
exports.getUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // userId가 제공되지 않았거나 잘못된 경우 처리
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    // 사용자 조회
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // 성공 응답
    res.status(200).json({ user });

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

// 회원 탈퇴
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // userId가 제공되지 않았거나 잘못된 경우 처리
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    // 사용자 조회
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // 이미 탈퇴 처리된 사용자인지 확인
    if (user.isWithdrawn) {
      return res.status(400).json({ error: 'User has already been withdrawn.' });
    }

    // 사용자 상태를 탈퇴로 변경
    await user.update({ isWithdrawn: true });

    // 성공 응답
    res.status(200).json({ message: 'User has been withdrawn successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

// 로그아웃
exports.userLogout = async (req, res) => {
  try {
    // // 세션 삭제
    // req.session.destroy((err) => {
    //   if (err) return res.status(500).send('Failed to logout.');
    //   // 로그아웃 성공 응답
    //   res.status(200).json({ message: 'Logged out successfully.' });
    //   // 로그아웃 완료하면 메인(전체 게시물 목록)페이지로 이동
    //   res.redirect('/');
    // });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}