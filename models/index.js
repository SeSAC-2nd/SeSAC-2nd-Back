const Sequelize = require("sequelize"); // sequelize 패키지 불러오기

// db 연결 정보
const config = require(__dirname + "/../config/config.js");

const db = {}; // 빈 객체

// config 안에 있는 데이터를 가지고 새로은 Sequelize 객체 생성
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// 모델 불러오기
const UserModel = require("./User")(sequelize, Sequelize);
const AddressModel = require("./Address")(sequelize, Sequelize);
const CartModel = require("./Cart")(sequelize, Sequelize);
const CommentModel = require("./Comment")(sequelize, Sequelize);
const ComplaintModel = require("./Complaint")(sequelize, Sequelize);
const DeliveryModel = require("./Delivery")(sequelize, Sequelize);
const TermsAgreeModel = require("./TermsAgree")(sequelize, Sequelize);
const WishlistModel = require("./Wishlist")(sequelize, Sequelize);
const SellerModel = require("./Seller")(sequelize, Sequelize);
const PostModel = require("./Post")(sequelize, Sequelize);
const OrderModel = require("./Order")(sequelize, Sequelize);
const OrderLogsModel = require("./OrderLogs")(sequelize, Sequelize);
const ManagerModel = require("./Manager")(sequelize, Sequelize);
const CategoryModel = require("./Category")(sequelize, Sequelize);
const ProductImageModel = require("./ProductImage")(sequelize, Sequelize);

// 관계 연결
// Address와 User(N:1)
UserModel.hasMany(AddressModel, { foreignKey: "userId" });
AddressModel.belongsTo(UserModel, { foreignKey: "userId" });

// TermsAgree와 User(1:1)
UserModel.hasOne(TermsAgreeModel, { foreignKey: "userId" });
TermsAgreeModel.belongsTo(UserModel, { foreignKey: "userId" });

// Complaint와 Post(N:1)
PostModel.hasMany(ComplaintModel, { foreignKey: "postId" });
ComplaintModel.belongsTo(PostModel, { foreignKey: "postId" });

// Complaint와 User(N:1)
UserModel.hasMany(ComplaintModel, { foreignKey: "userId" });
ComplaintModel.belongsTo(UserModel, { foreignKey: "userId" });

// Complaint와 Seller(N:1)
SellerModel.hasMany(ComplaintModel, { foreignKey: "sellerId" });
ComplaintModel.belongsTo(SellerModel, { foreignKey: "sellerId" });

// Seller와 Delivery(1:1)
DeliveryModel.hasOne(SellerModel, { foreignKey: "deliveryId" });
SellerModel.belongsTo(DeliveryModel, { foreignKey: "deliveryId" });

// Seller와 User(1:1)
UserModel.hasOne(SellerModel, { foreignKey: "userId" });
SellerModel.belongsTo(UserModel, { foreignKey: "userId" });

// Cart와 User(N:1)
UserModel.hasMany(CartModel, { foreignKey: "userId" });
CartModel.belongsTo(UserModel, { foreignKey: "userId" });

// Cart와 Post(N:1)
PostModel.hasMany(CartModel, { foreignKey: "postId" });
CartModel.belongsTo(PostModel, { foreignKey: "postId" });

// Wishlist와 User(N:1)
UserModel.hasMany(WishlistModel, { foreignKey: "userId" });
WishlistModel.belongsTo(UserModel, { foreignKey: "userId" });

// Wishlist와 Post(N:1)
PostModel.hasMany(WishlistModel, { foreignKey: "postId" });
WishlistModel.belongsTo(PostModel, { foreignKey: "postId" });

// Post와 Seller(N:1)
SellerModel.hasMany(PostModel, { foreignKey: "sellerId" });
PostModel.belongsTo(SellerModel, { foreignKey: "sellerId" });

// Post와 Category(1:1)
CategoryModel.hasMany(PostModel, { foreignKey: "categoryId" });
PostModel.belongsTo(CategoryModel, { foreignKey: "categoryId" });

// Comment와 User(N:1)
UserModel.hasMany(CommentModel, { foreignKey: "userId" });
CommentModel.belongsTo(UserModel, { foreignKey: "userId" });

// Comment와 Post(N:1)
PostModel.hasMany(CommentModel, { foreignKey: "postId" });
CommentModel.belongsTo(PostModel, { foreignKey: "postId" });

// Comment와 Comment(N:1)
CommentModel.hasMany(CommentModel, {
  as: "replies",
  foreignKey: "parentComId",
});
CommentModel.belongsTo(CommentModel, {
  as: "parentComment",
  foreignKey: "parentComId",
});

// ProductImage와 Post(N:1)
PostModel.hasMany(ProductImageModel, { foreignKey: "postId" });
ProductImageModel.belongsTo(PostModel, { foreignKey: "postId" });

// Order와 User(N:1)
UserModel.hasMany(OrderModel, { foreignKey: "userId" });
OrderModel.belongsTo(UserModel, { foreignKey: "userId" });

// Order와 Post(1:1)
PostModel.hasOne(OrderModel, { foreignKey: "postId" });
OrderModel.belongsTo(PostModel, { foreignKey: "postId" });

// OrderLogs와 Order(N:1)
OrderModel.hasMany(OrderLogsModel, { foreignKey: "orderId" });
OrderLogsModel.belongsTo(OrderModel, { foreignKey: "orderId" });

// OrderLogs와 Manager(N:1)
ManagerModel.hasMany(OrderLogsModel, { foreignKey: "managerId" });
OrderLogsModel.belongsTo(ManagerModel, { foreignKey: "managerId" });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// db 에 만든 모델 집어넣기
db.User = UserModel;
db.Address = AddressModel;
db.Cart = CartModel;
db.Comment = CommentModel;
db.Complaint = ComplaintModel;
db.Delivery = DeliveryModel;
db.TermsAgree = TermsAgreeModel;
db.Wishlist = WishlistModel;
db.Seller = SellerModel;
db.Post = PostModel;
db.Order = OrderModel;
db.OrderLogs = OrderLogsModel;
db.Manager = ManagerModel;
db.Category = CategoryModel;
db.ProductImage = ProductImageModel;

// db 객체를 내보내기 -> 다른 파일에서 db모듈 사용 예정
module.exports = db;
