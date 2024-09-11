const complaintModel = (sequelize, DataTypes) => {
  const Complaint = sequelize.define(
    "Complaint",
    {
      complaintId: {
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
      sellerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      complaintContent: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
    }
  );
  return Complaint;
};

module.exports = complaintModel;
