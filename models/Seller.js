const sellerModel = (sequelize, DataTypes) => {
  const Seller = sequelize.define(
    "Seller",
    {
      sellerId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      deliveryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sellerName: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      sellerImg: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      sellerExplain: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      isDeleted: {
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
  return Seller;
};

module.exports = sellerModel;
