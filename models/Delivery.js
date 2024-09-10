const deliveryModel = (sequelize, DataTypes) => {
  const Delivery = sequelize.define(
    "Delivery",
    {
      deliveryId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      deliveryName: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      deliveryFee: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      deliveryDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );
  return Delivery;
};

module.exports = deliveryModel;
