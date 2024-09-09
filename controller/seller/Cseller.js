const { Seller, Post} = require('../../models/index');
const db =require('../../models/index');

// 판매자 등록
// 판매자 이미지 코드 추가해야 함
exports.insertSeller = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { userId }= req.session.user;
    const { sellerName, sellerExplain, deliveryId } = req.body;

    const seller = await Seller.findOne({
      where: { userId },
      transaction: t
    })
    
    if (seller) {
      return res.status(404).json({ error: '이미 판매자 등록이 되어 있습니다.' });
    }

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

    // 파일이 업로드된 경우, 파일 URL을 updatedData에 추가
    if (req.file) {
      newData.sellerImg = req.file.location; // S3에 업로드된 파일의 URL
    }
    
    const newSeller = await Seller.create( newData, { transaction: t });

    if (newSeller) {
      // 세션에 sellerId 저장
      req.session.user = {
        ...req.session.user,
        sellerId: newSeller.sellerId
      };

      const user = await db.User.findOne({ 
        where: userId,
        attributes: [
          "userId","isBlacklist"
        ],
      });

      await t.commit();

      const session = {
        userId : user.userId,
        sellerId : newSeller.sellerId || '',
        isBlacklist : user.isBlacklist,
      }

      // 세션 저장 후 응답
      req.session.save((err) => {
        if (err) {
          console.error('세션 저장 오류:', err);
          return res.status(500).json({ error: '세션 저장 중 오류가 발생했습니다.' });
        }
        res.status(200).json({ message: '판매자가 성공적으로 등록되었습니다.', seller: session });
      });
    
    } else {
      res.status(500).json({ result: false, error: '판매자 등록 실패' });
    }

    console.log(req.session);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

// 판매자 조회
exports.getSeller = async (req, res) => {
  try {
    const { sellerId } = req.session.user;

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
  const t = await db.sequelize.transaction();

  try {
    const { sellerId } = req.session.user;
    const { sellerName, sellerExplain } = req.body;

    if (!sellerId) {
      return res.status(400).json({ error: '판매자 ID가 필요합니다.' });
    }
    
    const seller = await Seller.findOne({
      where : {sellerId},
      transaction: t
    });

    if (!seller) {
      return res.status(404).json({ error: '판매자를 찾을 수 없습니다.' });
    }

    if (sellerName) {
      const sellerNameRegex = /^[a-zA-Z0-9가-힣!@#$%^&*]{2,15}$/;
      if (!sellerNameRegex.test(sellerName)) {
        return res.status(400).json({ error: '유효하지 않은 판매자명입니다.' });
      }
    }

    const updatedData = {
      sellerName: sellerName || seller.sellerName,
      sellerExplain: sellerExplain !== undefined ? sellerExplain : seller.sellerExplain
    };

    // 파일이 업로드된 경우, 파일 URL을 updatedData에 추가
    if (req.file) {
      updatedData.sellerImg = req.file.location; // S3에 업로드된 파일의 URL
    }

    await seller.update(updatedData, { transaction: t });

    await t.commit();

    res.status(200).json({ 
      message: '판매자 정보가 성공적으로 업데이트되었습니다.', 
      seller: updatedData,
      file: req.file ? {
        filename: req.file.key,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: req.file.location
      } : null
    });

  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}



// 판매자 삭제
exports.deleteSeller = async (req, res) => {
  try {
    const { sellerId } = req.session.user;

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

    // 판매 중인 판매글이 있는지 확인
    const hasActivePosts = posts.some(post => post.sellStatus === "판매 중");
    if (hasActivePosts) {
      return res.status(400).json({ error: '판매 중인 판매글이 있어 삭제할 수 없습니다.' });
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