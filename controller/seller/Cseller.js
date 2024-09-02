const { Seller, Post } = require('../../models/index');

// 판매자 등록
// 판매자 이미지 코드 추가해야 함
exports.insertSeller = async (req, res) => {
  try {
    // userId는 이후 세션으로 대체
    const { userId, sellerName, sellerExplain, deliveryId } = req.body;

    // sellerName 정규표현식 검사(가능: 한글/영어/특수문자/숫자, 2~15글자)
    const sellerNameRegex = /^[a-zA-Z0-9가-힣!@#$%^&*]{2,15}$/;
    if (!sellerNameRegex.test(sellerName))
      return res.status(400).json({ error: '유효하지 않은 판매자명입니다.' });

    const newData = {
      userId,
      sellerName,
      sellerExplain: sellerExplain || null,
      deliveryId
    }

    const newSeller = await Seller.create(newData);

    if (newSeller) res.status(200).json({ message: '판매자가 성공적으로 등록되었습니다.', seller: newSeller });
    else res.status(500).json({ result: false, error: '판매자 등록 실패' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

// 판매자 조회
exports.getSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    // sellerId가 제공되지 않았거나 잘못된 경우 처리
    if (!sellerId) {
      return res.status(400).json({ error: '판매자 ID가 필요합니다.' });
    }

    // 판매자 조회
    const seller = await Seller.findByPk(sellerId);
    if (!seller) {
      return res.status(404).json({ error: '판매자를 찾을 수 없습니다.' });
    }

    // 성공 응답
    res.status(200).json({ seller });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

// 판매자 수정
// 이미지 코드 추가해야 함
exports.updateSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { sellerName, sellerExplain } = req.body;

    // sellerId가 제공되지 않았거나 잘못된 경우 처리
    if (!sellerId) {
      return res.status(400).json({ error: '판매자 ID가 필요합니다.' });
    }

    // 판매자 조회
    const seller = await Seller.findByPk(sellerId);
    if (!seller) {
      return res.status(404).json({ error: '판매자를 찾을 수 없습니다.' });
    }

    // sellerName 정규표현식 검사 (필요 시)
    if (sellerName) {
      const sellerNameRegex = /^[a-zA-Z0-9가-힣!@#$%^&*]{2,15}$/;
      if (!sellerNameRegex.test(sellerName)) {
        return res.status(400).json({ error: '유효하지 않은 판매자명입니다.' });
      }
    }

    // 데이터 값이 없을 경우 기존 데이터로 대체
    const updatedData = {
      sellerName: sellerName || seller.sellerName,
      sellerExplain: sellerExplain !== undefined ? sellerExplain : seller.sellerExplain
    };

    // 데이터 업데이트
    await seller.update(updatedData);

    // 성공 응답
    res.status(200).json({ message: '판매자 정보가 성공적으로 업데이트되었습니다.', seller: updatedData });

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}


// 판매자 삭제
exports.deleteSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    // sellerId가 제공되지 않았거나 잘못된 경우 처리
    if (!sellerId) {
      return res.status(400).json({ error: '판매자 ID가 필요합니다.' });
    }

    // 판매자 조회
    const seller = await Seller.findByPk(sellerId);
    if (!seller) {
      return res.status(404).json({ error: '판매자를 찾을 수 없습니다.' });
    }

    // 판매자의 판매글 조회
    const posts = await Post.findAll({ where: { sellerId } });

    // 판매중인 판매글이 있는지 확인
    const hasActivePosts = posts.some(post => post.sellStatus === "판매중");
    if (hasActivePosts) {
      return res.status(400).json({ error: '판매중인 판매글이 있어 삭제할 수 없습니다.' });
    }

    // 이미 삭제 처리된 판매자인지 확인
    if (seller.isDeleted) {
      return res.status(400).json({ error: '이미 삭제 처리된 판매자입니다.' });
    }

    // 판매자 삭제
    await seller.update({ isDeleted: true });

    // 성공 응답
    res.status(200).json({ message: '판매자가 성공적으로 삭제 처리되었습니다.' })
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}