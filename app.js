const express = require("express");
const app = express();
const path = require("path");
const dotenv = require("dotenv");
const { sequelize } = require("./models");

// dotenv 모듈을 이용해 .env 파일의 환경 변수를 불러옴
dotenv.config({
  // 기본 .env 파일 로드
  path: path.resolve(__dirname, ".env"),
});

const port = process.env.PORT || 5000;

// 테이블을 생성하고 처음에만 force : true 로 실행하고 그 뒤로는 false로 변경하고 실행
sequelize
  .sync({ force: true }) // force : true -> 서버 실행때마다 테이블 재생성(데이터 다 날아감), false -> 서버 실행 시 테이블 없으면 생성
  .then(() => {
    app.listen(port, () => {
      console.log("database connection succeed");
      console.log(`http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
