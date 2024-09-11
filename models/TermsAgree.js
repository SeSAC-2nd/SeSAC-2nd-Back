const termsAgreeModel = (sequelize, DataTypes) => {
  const TermsAgree = sequelize.define(
    "Terms_Agree",
    {
      agreeId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      isRequiredAgreed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isOptionalAgreed: {
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
  return TermsAgree;
};

module.exports = termsAgreeModel;
