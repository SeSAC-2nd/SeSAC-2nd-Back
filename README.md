# 💎 리블링스(Lieblings)

> SeSAC 영등포 6기 2차 프로젝트(240821~240912)

![KakaoTalk_20241018_183735873](https://github.com/user-attachments/assets/9e020f47-4c79-4568-8502-4ccdb4031d55)


📃 [리블링스 발표자료 PDF](https://github.com/user-attachments/files/17436078/lieblings_.pdf)


📁 [Back Repository](https://github.com/SeSAC-2nd/SeSAC-2nd-Back)

📁 [Front Repository](https://github.com/SeSAC-2nd/SeSAC-2nd-Front)

📝 [프로젝트 회고록 및 트러블슈팅](https://mont-blanc.tistory.com/71)

<br/>

## 🔹 목차

1. [프로젝트 소개](#프로젝트-소개)
2. [팀원 구성](#팀원-구성)
3. [개발 환경](#개발-환경)
4. [설치 및 실행](#설치-및-실행)
5. [브랜치 전략](#브랜치-전략)
6. [시스템 아키텍처](#시스템-아키텍처)
7. [팀내 역할](#팀내-역할)
8. [주요 테이블 설계](#주요-테이블-설계)
9. [구현 기능](#구현-기능)
10. [회고](#회고)

<br/>

## 프로젝트 소개

### 💕나의 구최애가 너의 현최애다, 너의 구최애가 나의 현최애다.

<span title="특정한 분야나 대상을 열정적으로 좋아하고 그에 대한 활동을 즐기는 것을 의미합니다." style="color:pink">덕질</span>의 즐거움을 함께 나누는 공간, 리블링스는 독일어로 <span style="color:pink" title="최고로 애정하는">'최애'</span>를 의미합니다.
덕질의 열정은 시간이 흘러도 변하지 않습니다. 하지만 최애가 바뀌기도 하고, 새로운 애정을 찾기도 합니다. 저희 웹 사이트는 K-pop, 스포츠, 애니메이션, 영화/드라마, 게임, 스포츠 등 <span style="background-color:#ffdce0">'다양한 덕질 분야의 물품을 중고 거래할 수 있는 공간'</span>입니다.

<br/>

## 팀원 구성

<table style="width: 100%; text-align: center; border-collapse: collapse; table-layout: fixed;">
  <tr>
    <th></th>
    <th style="text-align: center;">강예나</th>
    <th style="text-align: center;">김어진</th>
    <th style="text-align: center;">김지민</th>
    <th style="text-align: center;">양태완</th>
    <th style="text-align: center;">윤예슬</th>
    <th style="text-align: center;">이다인</th>
  </tr>


  <tr>
    <th style="width: 100% height: 100px;">Profile</th>
    <td style="width: 15% height: 100px;"><img src="https://github.com/user-attachments/assets/38bce886-7793-44f5-b2f0-afba0d927b33" style="width: 100%; max-width: 100px; height: auto; object-fit: cover;"></td>
    <td style="width: 15% height: 100px;"><img src="https://github.com/user-attachments/assets/8a110b6c-99c5-419d-b404-10a6715a1e33" style="width: 100%; max-width: 100px; height: auto; object-fit: cover;"></td>
    <td style="width: 15% height: 100px;"><img src="https://github.com/user-attachments/assets/4aef3850-6909-4ca3-a346-6bc123120971" style="width: 100%; max-width: 100px; height: auto; object-fit: cover;"></td>
    <td style="width: 15% height: 100px;"><img src="https://github.com/user-attachments/assets/6c6c006f-02c2-4fe3-800f-43aca654f121" style="width: 100%; max-width: 100px; height: auto; object-fit: cover;"></td>
    <td style="width: 15% height: 100px;"><img src="https://github.com/user-attachments/assets/4c3895e2-4237-41eb-9d86-e8d22d908c60" style="width: 100%; max-width: 100px; height: auto; object-fit: cover;"></td>
    <td style="width: 15% height: 100px;"><img src="https://github.com/user-attachments/assets/7464ffb1-aa06-4718-9ec6-c2e2bc68c7d3" style="width: 100%; max-width: 100px; height: auto; object-fit: cover;"></td>
  
    
  </tr>
  <tr>
    <th>Role</th>
    <td>FE</td>
    <td>[팀장] BE, DevOps</td>
    <td>BE, DevOps</td>
    <td>FE, BE, DevOps</td>
    <td>FE</td>
    <td>FE</td>
  </tr>
  <tr>
    <th>GitHub</th>
    <td><a href="https://github.com/yenaf">yenaf</a></td>
    <td><a href="https://github.com/qldirr">qldirr</a></td>
    <td><a href="https://github.com/cmkoi1">cmkoi1</a></td>
    <td><a href="https://github.com/behindy3359">behindy3359</a></td>
    <td><a href="https://github.com/errorose">errorose</a></td>
    <td><a href="https://github.com/DAIN302">DAIN302</a></td>
  </tr>
</table>

<br/>

## 개발 환경

#### Languages

<img src="https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white"> <img src="https://img.shields.io/badge/sass-1.77.8-CC6699?style=for-the-badge&logo=sass&logoColor=white"> <img src="https://img.shields.io/badge/css3-1572B6?style=for-the-badge&logo=css3&logoColor=white"> <img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=white">

#### Frameworks

<img src="https://img.shields.io/badge/node.js-20.14.0-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white"> <img src="https://img.shields.io/badge/express-4.19.2-000000?style=for-the-badge&logo=express&logoColor=white"> <img src="https://img.shields.io/badge/react-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white">

#### Libraries

<img src="https://img.shields.io/badge/bcrypt-5.1.1-232F3E?style=for-the-badge&logoColor=white"> <img src="https://img.shields.io/badge/express_session-1.18.0-000000?style=for-the-badge&logoColor=white"> <img src="https://img.shields.io/badge/multer-1.4.5-F46519?style=for-the-badge&logo=multer&logoColor=white"> <img src="https://img.shields.io/badge/winston-3.14.2-000000?style=for-the-badge&logo=winston&logoColor=white"> <img src="https://img.shields.io/badge/sequelize-6.37.3-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white"> <img src="https://img.shields.io/badge/axios-1.7.7-5A29E4?style=for-the-badge&logo=axios&logoColor=white"> <img src="https://img.shields.io/badge/jquery-3.7.1-0769AD?style=for-the-badge&logo=jquery&logoColor=white"> <img src="https://img.shields.io/badge/redux-5.0.1-764ABC?style=for-the-badge&logo=redux&logoColor=white">

#### Databases

<img src="https://img.shields.io/badge/mysql-3.11.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white">

#### Deployment

<img src="https://img.shields.io/badge/amazonwebservices-232F3E?style=for-the-badge&logo=amazonwebservices&logoColor=white"> <img src="https://img.shields.io/badge/amazonec2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white"> <img src="https://img.shields.io/badge/amazons3-569A31?style=for-the-badge&logo=amazons3&logoColor=white"> <img src="https://img.shields.io/badge/amazonrds-527FFF?style=for-the-badge&logo=amazonrds&logoColor=white"> <img src="https://img.shields.io/badge/nginx-009639?style=for-the-badge&logo=nginx&logoColor=white"> <img src="https://img.shields.io/badge/pm2-2B037A?style=for-the-badge&logo=pm2&logoColor=white">

#### Development Environment and Tool

<img src="https://img.shields.io/badge/git-F05032?style=for-the-badge&logo=git&logoColor=white"> <img src="https://img.shields.io/badge/github-181717?style=for-the-badge&logo=github&logoColor=white"> <img src="https://img.shields.io/badge/postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white"> <img src="https://img.shields.io/badge/figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white"> <img src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white">

#### Communication Tools

<img src="https://img.shields.io/badge/slack-4A154B?style=for-the-badge&logo=slack&logoColor=white"> <img src="https://img.shields.io/badge/notion-000000?style=for-the-badge&logo=notion&logoColor=white">

<br/>

## 설치 및 실행

```
### 사전 요구사항
- Node.js
- npm (Node Package Manager)

### 설치 단계

// 저장소 클론
git clone https://github.com/SeSAC-2nd/SeSAC-2nd-Back.git
cd [프로젝트 디렉토리]

// 의존성 설치
npm install

// .env 파일에 필요 환경 변수 설정
PORT=3000  # 애플리케이션이 수신 대기할 포트 번호
DB_HOST=your-database-host.rds.amazonaws.com    # 데이터베이스 호스트 주소
DB_USER=your_database_username   # 데이터베이스 사용자 이름
DB_PASSWORD=your_secure_database_password    # 데이터베이스 비밀번호
DB_NAME=your_database_name   # 데이터베이스 이름
DIALECT=mysql   # 데이터베이스 방언 (MySQL 사용)

SALTNUM=12   # 비밀번호 해싱을 위한 Salt 라운드 수
SESSION_SECRET_KEY=your_very_long_and_random_secret_key   # 세션 암호화를 위한 비밀 키

AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXXX   # AWS IAM 사용자의 액세스 키 ID
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx    # AWS IAM 사용자의 비밀 액세스 키
AWS_REGION=ap-northeast-2   # AWS 리전
S3_BUCKET_NAME=your-unique-s3-bucket-name   # S3 버킷 이름

//서버 실행
npm start
```

<br>

## 브랜치 전략

> back

```
  Main branch
      └── dev
	    ├── frontDev
	    |  ├── feat/login
	    |  ├── feat/register
	    |  └── feat/post
	    |  └── feat/multer
	    |  └── hotfix/user
```

> front

```
  Main branch
      └── dev ── fork
                  ├── Main branch
                  ├── dev
                  |  ├── MainPage
                  |  ├── RegisterPage
                  |  ├── SellersPage
                  |  ├── MyPage
                  |  ├── ···Page
                            ·
                            ·
                            ·
```

<br/>

## 시스템 아키텍처
<img src="https://github.com/user-attachments/assets/eaad7281-840c-4c03-8fb7-252aa6042678" width=700>


<!-- 
```
  SESAC-2ND-FRONT
├── public - 공통리소스 저장공간
├── src - 리액트 앱이 저장될 장소
│ ├── api - axios 통신 함수 모음
│ ├── components - (하위)컴포넌트모음 
│ │                          
│ ├── data - 카테고리 데이터, 테스트용 더미 데이터 객체 모음
│ ├── hooks - 커스텀 훅 모음
│ ├── layout - 공통 레이아웃 모음
│ │ └── routes - 공통라우트 모음
│ │
│ ├── pages - 페이지(상위)컴포넌트 작성
│ ├── store - 전역 상태 관리용
│ ├── styles - 사이트에 적용될 스타일모음
│ │ │
│ │ ├── common - 공통 스타일 모음
│ │ ├── layout - 레이아웃 관련 스타일 모음
│ │ └── pages - 페이지 스타일 모음
│ └── utils - 공통 함수를 추출해 분류
└── App.js - React 애플리케이션의 루트 컴포넌트
```

```
  SESAC-2ND-BACK
├── config - sequelize 등의 설정 파일 모음
├── controller - API 요청에 대해 실제로 어떤 동작을 하게될 지 정의
│ │                   
│ └── index.js
│
├── middlewares - 미들웨어
│        multer - 파일 전송용 
│        session - 세션 설정용
│        winston - 로그 기록용
│
├── models - sequelize의 모델을 정의, db 연결 객체를 생성              
├── routes - 리액트에서 요청받은 요청들을 분류하는 라우트
├── utils - 여러 함수에서 사용하는 공통유틸을 추출
├── logs - winston 미들웨어를 통해 로그를 기록하는 디렉토리          
└── app.js - 애플리케이션의 주 진입점 파일
```
-->

<br/>

## 팀내 역할 
  - 결제 처리 및 블랙리스트 관리 등 트랜잭션이 필요한 주요 로직 구현
  - 시스템 또는 애플리케이션의 전반적인 구조 설계 책임
  - 프론트엔드와 백엔드 간의 통신 및 데이터 처리 과정에서 발생하는 문제 해결
  - AWS 인프라 설정 및 유지보수 작업
  - DB 초기 설정 및 운영 관리
  - 서버 측 코드 베이스 및 환경 설정 작업


<br/>

## 주요 테이블 설계
<img src="https://github.com/user-attachments/assets/d200e95b-7bcc-41f3-bdcf-b1d265ef9cf4" width=900>

- 회원(User) 테이블과 판매글(Post) 테이블 간 행위 테이블인 구매(Order) 테이블을 생성 

<!-- - [요구분석 정의서/명세서](https://docs.google.com/spreadsheets/d/1Ya0RCD4RilnOiLNQEIT97pBJ_jZ2YYCjc8nT2JiX4nU/edit?gid=0#gid=0) -->

<!-- - [화면 설계](https://www.figma.com/design/DWtFFjfUstdvSYmbkATfLE/sesac-2nd-pj?node-id=0-1&node-type=canvas&t=7Fuy1V5MQoBPyhzW-0)
- [명명법](https://docs.google.com/spreadsheets/d/1QaX_eHmUnU0yDstVW9tcm-4Va23pm7ib7xM4YGWIkAQ/edit?gid=0#gid=0) -->

<br/>

## 구현 기능

#### 판매자
<img src="https://github.com/user-attachments/assets/f8adbd69-e7bc-400d-9384-489601f87a93" style="width:600px">

- 일반 회원이 판매글을 등록하고 싶다면 판매자 등록부터 진행
- 판매글에 대해 주문이 생성되면 송장번호를 입력 -> 배송 상태가 '배송 중'으로 변경
- 판매글이 '판매 예약' 상태면 판매글 수정 및 삭제 불가
  
<br/>

#### 구매자
<img src="https://github.com/user-attachments/assets/1a3400ec-4f03-4281-bc06-9e378d95a870" style="width:600px">

- 구매자는 판매글에 대해 찜 등록 및 삭제, 장바구니 담기, 판매글 신고 가능
- 구매자가 결제를 진행하면 결제 대금이 관리자에게 전달
- 주문 건에 대해 구매확정을 하면 결제 대금이 판매자에게 전달
  
<br/>

#### 관리자
<img src="https://github.com/user-attachments/assets/0287020f-33a9-43b7-858f-14c61faae23b" style="width:600px">


- 관리자는 일반 회원이 할 수 있는 판매 물품 찜 및 구매가 불가
- 관리자가 특정 판매자를 블랙리스트에 추가할 경우, 해당 판매자의 '판매 완료'되지 않은 주문 건에 대해 구매자에게 환불 처리
- 구매자가 결제를 진행하여 주문이 생성되면 결제 대금이 관리자에게 전달, 구매자가 구매한 물품을 '구매 확정'을 하면 결제 대금이 판매자에게 전달(관리자가 대금을 중개하는 역할)
  
<br/>

#### 로그인/회원가입
<img src="https://github.com/user-attachments/assets/ed7bfc02-5579-435a-97cd-c18f028853bb" style="width:600px">


<br/>
<br/>

#### 메인 페이지 및 소개 페이지
<img src="https://github.com/user-attachments/assets/967d1c48-bc7c-4327-a1cc-7d8089684aa1" style="width:600px">


<br/>
<br/>

#### 반응형
<img src="https://github.com/user-attachments/assets/c67a4046-3a94-4758-95cf-ad7f397bdcb2">



<br/>


## 회고

> 이번 프로젝트는 제가 처음으로 프론트엔드와 백엔드로 포지션을 나누어 진행한 경험이었고, 프로젝트 기간이 짧지 않았던 만큼 팀원들과의 지속적인 소통의 중요성을 깊이 깨달았습니다. <br/> 특히, 프론트엔드 담당 팀원들과 화면에 데이터를 출력하는 구조에 대해 많은 논의를 진행했습니다. <br/> 이 과정에서 예외 처리와 응답 구조의 일관성이 얼마나 중요한지 깨달았으며, 프론트엔드와의 소통이 부족했던 부분을 보완해야 한다는 점을 느꼈습니다. <br/> 또한, 중간에 팀원이 교체되는 상황을 겪으면서 새로운 팀원과의 원활한 협업을 위해 문서화를 더욱 꼼꼼히 해야 한다는 교훈도 얻었습니다.
