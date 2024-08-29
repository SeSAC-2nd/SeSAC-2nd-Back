const addressModel = (sequelize, DataTypes) => {
  const Address = sequelize.define(
    "Address",
    {
      addId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      addName: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      zipCode: {
        type: DataTypes.STRING(7),
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      detailedAddress: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      freezeTableName: true,
    }
  );
  return Address;
};

module.exports = addressModel;
