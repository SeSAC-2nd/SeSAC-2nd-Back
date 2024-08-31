const postModel = (sequelize, DataTypes) => {
  const Post = sequelize.define(
    "Post",
    {
      postId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      sellerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      postTitle: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      postContent: {
        type: DataTypes.STRING(1000),
        allowNull: false,
      },
      productPrice: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      productType: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      productStatus: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      sellStatus: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      isOrdered: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      freezeTableName: true,
    }
  );
  return Post;
};

module.exports = postModel;
