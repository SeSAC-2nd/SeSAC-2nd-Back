const session = require("express-session");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    // 세션 쿠키 설정(세션 관리할때 클라이언트로 보내는 쿠키)
    httpOnly: false, // 클라이언트에서 쿠키 확인 못하게 막음
    secure: false, // http에서 사용 가능하도록(false는 https에서만 사용 가능)
    maxAge: 2 * 24 * 60 * 60 * 1000, // 단위(ms)
  },
});

module.exports = sessionMiddleware;
