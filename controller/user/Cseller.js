const { Seller } = require('../../models/index');

exports.insertSeller = async (req, res) => {
  try {
    const { sellerName, sellerExplain, deliveryId } = req.body;

    // sellerName 정규표현식 검사(가능: 한글/영어/특수문자/숫자, 2~15글자)
    const sellerNameRegex = /^[a-zA-Z0-9가-힣!@#$%^&*]{2,15}$/;
    if (!sellerNameRegex.test(sellerName))
      return res.status(400).json({ error: '유효하지 않은 판매자명입니다.' });

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

exports.getSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

exports.updateSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { sellerName, sellerImg, sellerExplain } = req.body;

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

exports.deleteSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}