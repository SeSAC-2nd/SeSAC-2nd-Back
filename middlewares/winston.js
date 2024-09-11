const winston = require('winston');
const expressWinston = require('express-winston');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');

// KST 시간으로 포맷팅하는 함수
const formatTimestamp = () => {
  return new Date().toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/[/]/g, '-');
};

const jsonFileTransport = new winston.transports.File({
  filename: path.join(logDir, 'requests.log'),
  format: winston.format.combine(
    winston.format.timestamp({
      format: formatTimestamp
    }),
    winston.format.json()
  )
});

// Winston 로거 설정
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logDir, 'combined.log') }),
  ],
});

// 개발 환경에서는 콘솔에도 로그 출력
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Express Winston 미들웨어 설정
const loggingMiddleware = expressWinston.logger({
  winstonInstance: logger,
  transports: [
    jsonFileTransport,
  ],
  meta: true,
  msg: "HTTP {{req.method}} {{req.url}}",
  expressFormat: true,
  colorize: false,
  ignoreRoute: function (req, res) { return false; },
  dynamicMeta: (req, res) => {
    return {
      timestamp: formatTimestamp()
    };
  }
});

module.exports = loggingMiddleware;