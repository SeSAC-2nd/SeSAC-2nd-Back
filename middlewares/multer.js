const aws = require("aws-sdk");
const multers3 = require("multer-s3");
const multer = require("multer");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("jpg, jpeg, png 형식의 이미지만 업로드 가능합니다."), false);
  }
};

const uploadSingle = multer({
  storage: multers3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: "public-read",
    contentType: multers3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      // 파일의 확장자 추출
      const ext = path.extname(file.originalname);
      // 확장자가 포함된 파일 이름 생성
      const fileName = `profile/${Date.now().toString()}-${path.basename(file.originalname, ext).slice(0,2)}${ext}`;
      cb(null, fileName);
    }
  }),
});

const uploadMul = multer({
  storage: multers3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: "public-read",
    contentType: multers3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, `product/${Date.now().toString()}-${file.originalname.slice(0.2)}`);
    }
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 각 파일 최대 크기 (5MB)
  }
});

// S3 업로드 결과 로깅 미들웨어
const logS3UploadResult = (req, res, next) => {
  if (req.file || req.files) {
    console.log('S3 업로드 성공 >>>> ');
  } else {
    console.log('S3 업로드 실패 또는 파일 없음 >>>>');
  }
  next();
};

module.exports = {
  uploadSingle,
  uploadMultiple: (fieldName) => [
    (req, res, next) => {
      req.uploadType = 'mul';
      next();
    },
    uploadMul.array(fieldName, 5),
    (req, res, next) => {
      if (req.files) {
        req.files = req.files.map(file => ({
          ...file,
          location: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}`
        }));
      }
      next();
    }
  ],
  logS3UploadResult
};