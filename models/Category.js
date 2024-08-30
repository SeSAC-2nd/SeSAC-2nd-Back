const categoryModel = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
    {
      categoryId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      categoryName: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );
  return Category;
};

module.exports = categoryModel;
