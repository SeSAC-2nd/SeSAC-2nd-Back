const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
  // 기본 .env 파일 로드
  path: path.resolve(__dirname, "../.env"),
});

const bcrypt = require("bcrypt");
const saltRounds = parseInt(process.env.SALTNUM, 10);

// 비밀번호 해싱 함수 정의
exports.hashPw = (pw) => {
  return bcrypt.hashSync(pw, saltRounds);
};

// 비밀번호 정답 검증 함수 정의
exports.comparePw = (inputPw, originalPw) => {
  return bcrypt.compareSync(inputPw, originalPw);
};
