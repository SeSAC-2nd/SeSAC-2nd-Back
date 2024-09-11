const express = require("express");
const cors = require("cors");
const app = express();
const sessionMiddleware = require("./middlewares/session");
const { sequelize } = require("./models");
const loggingMiddleware = require("./middlewares/winston");

require("dotenv/config");
const config = require("./config/key");

// CORS 설정
const corsOptions = {
  origin: "http://localhost:3000", // React 앱의 URL
  credentials: true,
  // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};

// CORS 미들웨어 사용, router 위에다가 선언
app.use(sessionMiddleware);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(loggingMiddleware);

const indexRouter = require("./routes/index");
const cartRouter = require("./routes/cart/cart");
const userRouter = require("./routes/user/user");
const postRouter = require("./routes/post/post");
const orderPageRouter = require("./routes/order/orderPage");
const orderRouter = require("./routes/order/order");
const complaintRouter = require("./routes/complaint/complaint");
const adminRouter = require("./routes/admin/admin");
const mypageRouter = require("./routes/mypage/mypage");
const sellerRouter = require("./routes/seller/seller");
const commentRouter = require("./routes/comment/comment");
const wishlistRouter = require("./routes/wishlist/wishlist");
const addressRouter = require("./routes/address/address");

const path = require("path");
const dotenv = require("dotenv");

// dotenv 모듈을 이용해 .env 파일의 환경 변수를 불러옴
dotenv.config({
  // 기본 .env 파일 로드
  path: path.resolve(__dirname, ".env"),
});

const port = process.env.PORT || 5000;

// router 설정
app.use("/main", indexRouter);
app.use("/cart", cartRouter);
app.use("/user", userRouter);
app.use("/posts", postRouter);
app.use("/order", orderPageRouter);
app.use("/orders", orderRouter);
app.use("/complaints", complaintRouter);
app.use("/admin", adminRouter);
app.use("/mypage", mypageRouter);
app.use("/sellers", sellerRouter);
app.use("/comments", commentRouter);
app.use("/wishlist", wishlistRouter);
app.use("/addresses", addressRouter);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../build/build", "index.html"));
});

app.get("*", (req, res) => {
  res.send("404 Not Found");
});

// 테이블을 생성하고 처음에만 force : true 로 실행하고 그 뒤로는 false로 변경하고 실행
sequelize
  .sync({ force: false }) // force : true -> 서버 실행때마다 테이블 재생성(데이터 다 날아감), false -> 서버 실행 시 테이블 없으면 생성
  .then(() => {
    app.listen(port, () => {
      console.log("database connection succeed");
      console.log(`http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
