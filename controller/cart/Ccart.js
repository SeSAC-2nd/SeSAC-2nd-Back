const {
  Cart,
  Post,
  Seller,
  Delivery,
  Category,
  ProductImage,
} = require("../../models/index");

// 장바구니 페이지 이동(장바구니 내역 조회)
exports.getCartPage = async (req, res) => {
  try {
    const { userId } = req.session.user;
    const cartList = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Post,
          include: [
            {
              model: Seller,
              include: [
                {
                  model: Delivery,
                  attributes: ["deliveryName", "deliveryFee"],
                },
              ],
              attributes: ["sellerName"],
            },
            {
              model: Category,
              attributes: ["categoryName"],
            },
            {
              model: ProductImage,
              attributes: ["imgName"],
              where: {
                isThumbnail: true,
              },
            },
          ],
          attributes: [
            "sellerId",
            "categoryId",
            "postTitle",
            "productPrice",
            "productType",
            "productStatus",
            "sellStatus",
          ],
        },
      ],
      attributes: ["cartId", "postId"],
    });
    res.json(cartList);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 장바구니 등록
exports.insertCart = async (req, res) => {
  try {
    const { postId } = req.params;

    // userId는 session에서
    const { userId } = req.session.user;

    const findCartItem = await Cart.findOne({
      where: { userId, postId },
    });
    if (findCartItem) {
      res.status(409).send({ message: "이미 장바구니에 담겨있는 상품입니다." });
      return;
    }
    const newCart = await Cart.create({
      userId,
      postId,
    });
    res.json(newCart);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 장바구니 삭제
exports.deleteCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const isDeleted = await Cart.destroy({
      where: { cartId },
    });

    if (!isDeleted) return res.send(false);

    res.send(true);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
