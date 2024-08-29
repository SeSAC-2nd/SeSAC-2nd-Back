const userModel = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      loginId: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      userPw: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      nickname: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      userName: {
        type: DataTypes.STRING(8),
        allowNull: false,
      },
      phoneNum: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      profileImg: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      balance: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      isBlacklist: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isWithdrawn: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      freezeTableName: true,
    }
  );
  return User;
};

module.exports = userModel;
