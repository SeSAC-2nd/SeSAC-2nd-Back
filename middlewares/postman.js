const nodemailer = require('nodemailer');

// 이메일 전송을 위한 트랜스포터 설정
const transporter = nodemailer.createTransport({
  service: 'gmail',  // 사용할 이메일 서비스
  auth: {
    user: process.env.LIEBLINGS_EMAIL,  // 보내는 사람 이메일
    pass: process.env.LIEBLINGS_E_PW    // 이메일 비밀번호
  }
});

// HTML 이메일 템플릿 함수
function getHtmlTemplate() {
  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>리블링스에 오신 것을 환영합니다!</title>
        <style>
            @import url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2206-02@1.0/PyeongChangPeace-Bold.woff2');
            @import url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff');
            @import url('https://fastly.jsdelivr.net/gh/projectnoonnu/2406-2@1.0/PeoplefirstNeatLoudTTF.woff2');
        </style>
    </head>
    <body style="font-family: 'GmarketSansMedium', Arial, sans-serif; font-size: 18px; line-height: 1.6; color: #333; margin: 0; padding: 0;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 0;">
                    <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <tr>
                            <td style="background-color: #7469b6; color: white; text-align: center; padding: 20px; border-radius: 10px 10px 0 0;">
                                <h1 style="margin: 0; font-size: 28px; font-family: 'PyeongChangPeace-Bold', sans-serif;">리블링스에 오신 것을 환영합니다!</h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="background-color: #f4f4f4; padding: 30px; border-radius: 0 0 10px 10px;">
                                <h2 style="font-size: 24px; font-family: 'PyeongChangPeace-Bold', sans-serif; text-align: center; margin-bottom: 20px;">
                                    <span style="background: linear-gradient(to bottom, #7469b6 0%, #e3a5c7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">리블링스</span>와 함께하는 덕질의 즐거움
                                </h2>
                                <p style="font-family: 'PeoplefirstNeatLoudTTF', sans-serif; margin-bottom: 20px;">
                                    덕질의 열정은 시간이 흘러도 변하지 않습니다. 하지만 최애가 바뀌기도 하고, 새로운 애정을 찾기도 하지요. 저희 웹 사이트는 K-pop, 스포츠, 애니메이션, 영화/드라마, 게임 등 다양한 덕질 분야의 물품을 중고 거래할 수 있는 공간입니다.
                                </p>
                                <div style="text-align: center; margin: 30px 0; font-family: 'GmarketSansMedium', sans-serif; font-size: 22px; color: #f1ebe5; text-shadow: 0 4px 6px #ae85d2, 0px -1px 1px #fff; font-weight: bold; background: linear-gradient(to bottom, #ece4d9 0%, #d3aae8 100%); border-radius: 15px; padding: 20px 10px;">
                                    &#34; 나의 구최애가 너의 현최애다, 너의 구최애가 나의 현최애다. &#34;
                                </div>
                                <p style="font-family: 'PeoplefirstNeatLoudTTF', sans-serif; margin-bottom: 20px;">
                                    이곳에서는 여러분이 소중히 아꼈던 물품들이 새로운 주인을 만나 또 다른 이야기를 이어갈 수 있습니다. 누군가의 최애였던 아이템이 또 다른 누군가에게 큰 기쁨을 줄 수 있도록, 여러분의 추억을 함께 나누어 주세요.
                                </p>
                                <p style="font-family: 'PeoplefirstNeatLoudTTF', sans-serif; margin-bottom: 20px;">
                                    리블링스에서는 모든 거래 과정에서 사용자 보호를 최우선으로 생각합니다. 안전하고 편리한 거래를 지원하며, 여러분의 덕질이 더 풍성해지는 경험을 제공하기 위해 최선을 다하겠습니다.
                                </p>
                                <p style="font-family: 'PeoplefirstNeatLoudTTF', sans-serif; text-align: right; font-style: italic; margin-top: 30px;">
                                    리블링스 일동 올림
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="text-align: center; padding: 30px;">
                                <p style="color: #694f8e; font-size: 20px; margin-bottom: 20px;">리블링스와 함께 행복한 덕질을 시작해볼까요?</p>
                                <table role="presentation" style="margin: 0 auto;">
                                    <tr>
                                        <td style="padding: 10px;">
                                            <a href="http://13.125.19.233:8080/" style="background-color: #e3a5c7; border: 1px solid #e3a5c7; padding: 12px 25px; color: white; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; transition: background-color 0.3s;">Liebling 로</a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `;
}

  // 이메일 옵션 설정
  const mailOptions = {
    from: process.env.LIEBLINGS_EMAIL,
    to: '',
    html: getHtmlTemplate()  // HTML 콘텐츠
  };

module.exports = { transporter, mailOptions };
