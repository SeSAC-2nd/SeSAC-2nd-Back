const { Address } = require("../../models/index");

// 배송지 등록
exports.insertAddress = async (req, res) => {
  try {
    // userId는 session에서
    const {
      userId,
      addName,
      zipCode,
      address,
      detailedAddress,
      isDefault,
      receiver,
      phoneNum,
    } = req.body;

    // 만약 isDefault가 true로 설정되었으면, 기존 기본 주소를 false로 업데이트
    if (isDefault) {
      await Address.update(
        { isDefault: false }, // 기존 기본 주소의 isDefault를 false로 설정
        {
          where: {
            userId,
            isDefault: true, // 해당 유저의 기본 주소만 업데이트
          },
        }
      );
    }

    const newAddress = await Address.create({
      userId,
      addName,
      zipCode,
      address,
      detailedAddress,
      isDefault,
      receiver,
      phoneNum,
    });
    res.json(newAddress);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 회원 배송지 목록 조회
exports.getAddressList = async (req, res) => {
  try {
    // userId는 session에서
    const { userId } = req.body;
    const addressList = await Address.findAll({
      where: { userId },
      attributes: [
        "addId",
        "addName",
        "zipCode",
        "address",
        "detailedAddress",
        "isDefault",
        "receiver",
        "phoneNum",
      ],
    });
    res.json(addressList);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 배송지 조회
exports.getAddress = async (req, res) => {
  try {
    // userId는 session에서
    const { addId } = req.params;
    const address = await Address.findOne({
      where: { addId },
      attributes: [
        "addName",
        "zipCode",
        "address",
        "detailedAddress",
        "isDefault",
        "receiver",
        "phoneNum",
      ],
    });
    res.json(address);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 배송지 수정
exports.updateAddress = async (req, res) => {
  try {
    const { addId } = req.params;
    const {
      addName,
      zipCode,
      address,
      detailedAddress,
      isDefault,
      receiver,
      phoneNum,
    } = req.body;
    const [updateAddress] = await Address.update(
      {
        addName,
        zipCode,
        address,
        detailedAddress,
        isDefault,
        receiver,
        phoneNum,
      },
      { where: { addId } }
    );
    if (updateAddress === 1) {
      return res.send({ result: true });
    }
    res.send({ result: false });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 배송지 삭제
exports.deleteAddress = async (req, res) => {
  try {
    const { addId } = req.params;
    const deletedAddress = await Address.destroy({
      where: { addId },
    });
    if (!deletedAddress) return res.send(false);

    res.send(true);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
