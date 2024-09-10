const { Wishlist } = require("../../models/index");

// 찜 등록
exports.insertWishlist = async (req, res) => {
  try {
    // userId는 session에서
    const userId = req.session?.user?.userId;
    const { postId } = req.body;
    const newWishlist = await Wishlist.create({
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
