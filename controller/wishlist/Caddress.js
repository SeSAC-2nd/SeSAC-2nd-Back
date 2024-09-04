const { Address } = require("../../models/index");

// 찜 등록
exports.insertAddress = async (req, res) => {
  try {
    // userId는 session에서
    const { userId, postId } = req.body;
    const newWishlist = await Address.create({
      userId,
      postId,
    });
    res.json(newWishlist);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 찜 삭제
exports.deleteWishlist = async (req, res) => {
  try {
    const { wishlistId } = req.params;
    const deletedWishlist = await Wishlist.destroy({
      where: { wishlistId },
    });
    if (!deletedWishlist) return res.send(false);

    res.send(true);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};