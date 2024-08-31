const productImageModel = (sequelize, DataTypes) => {
  const ProductImage = sequelize.define(
    "Product_Image",
    {
      imgId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      imgName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      isThumbnail: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );
  return ProductImage;
};

module.exports = productImageModel;
