const aws = require("aws-sdk");
const multers3 = require("multer-s3");
const multer = require("multer");
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

exports.upload = multer({
  storage: multers3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: "public-read",
    contentType: multers3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, `sellers/${Date.now().toString()}-${file.originalname}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
// S3 업로드 결과 로깅 미들웨어
exports.logS3UploadResult = (req, res, next) => {
  if (req.file) {
    console.log('S3 업로드 성공 >>>>', {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      size: req.file.size,
      bucket: req.file.bucket,
      key: req.file.key,
      location: req.file.location
    });
  } else {
    console.log('S3 업로드 실패 또는 파일 없음 >>>>');
  }
  next();
};