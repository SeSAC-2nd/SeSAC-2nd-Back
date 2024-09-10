const orderLogsModel = (sequelize, DataTypes) => {
  const OrderLogs = sequelize.define(
    "Order_Logs",
    {
      orderLogId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      managerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      orderLogPrice: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      deposit: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      withdraw: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      logStatus: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );
  return OrderLogs;
};

module.exports = orderLogsModel;
