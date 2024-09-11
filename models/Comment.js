const commentModel = (sequelize, DataTypes) => {
  const Comment = sequelize.define(
    "Comment",
    {
      comId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      comContent: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      isSecret: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      parentComId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      freezeTableName: true,
    }
  );
  return Comment;
};

module.exports = commentModel;
