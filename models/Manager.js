const managerModel = (sequelize, DataTypes) => {
  const Manager = sequelize.define(
    "Manager",
    {
      managerId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      loginId: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      managerPw: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: false, 
    }
  );
  return Manager;
};

module.exports = managerModel;
