const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 정적 파일 제공 (현재 폴더의 html, js, css 파일 호스팅)
app.use(express.static(path.join(__dirname)));

// KOSIS 데이터 기반 백엔드 기본 데이터베이스 (Gemini API 키 미설정 시 백업용)
const mockDataStore = {
  '도박': {
    title: "중학생 대상 사이버 도박 예방 및 참여형 대안활동 기획안",
    target: "중등 1~3학년",
    bg: [
      "• <strong>위험 요인:</strong> 2024년 청소년 실태조사 결과, 중학생의 게임 이용률 34.3%, 미디어 시청 28.3%로 스마트기기 의존도 급증.",
      "• <strong>시간대 공백:</strong> 평일 16:00 ~ 18:00 사이 방과 후 보호자 미동행 및 자율 시간 비율이 48.2%로 최고치."
    ],
    timeTitle: "평일 방과 후 (16시~18시)",
    timeDesc: "학교 근처 청소년 문화의집 또는 지역 거점 공간 활용 권장.",
    methodTitle: "숏폼 제작 참여형 공모전",
    methodDesc: "중학생 SNS 이용률(11.0%) 증가에 맞춰 직접 도박 예방 숏폼을 제작하는 또래참여형 구조.",
    warning: "• <strong>단순 강당 집합식 시청각 교육 지양:</strong> 일방향 주입식 교육은 주입식 안전교육 만족도가 최하위(12.4%) 수준으로 실효성 미비."
  },
  '돌봄': {
    title: "방과 후 나홀로 청소년을 위한 온마을 돌봄 및 체험 기획안",
    target: "초등 고학년 (4~6학년)",
    bg: [
      "• <strong>돌봄 공백:</strong> 방과 후 홀로 시간을 보내는 초등 고학년 비율이 32.5%에 달함.",
      "• <strong>영양/안전:</strong> 석식 미제공 및 방과 후 비행 노출 위험 가능성 증가."
    ],
    timeTitle: "평일 15시 ~ 19시 (방과 후)",
    timeDesc: "청소년 방과후아카데미 및 지역 아동센터 연계 운영.",
    methodTitle: "창의 체험 및 석식 지원 특화",
    methodDesc: "요리, 코딩, 체육 등 소그룹 다빈도 체험 활동 구성.",
    warning: "• <strong>단순 자율 학습반 운영 지양:</strong> 학원 형태의 공부 위주 프로그램은 아동의 자발적 참여 의지를 저하시킴."
  },
  '숏폼': {
    title: "디지털 미디어 과의존 예방 및 숏폼 클린 캠페인 기획안",
    target: "전연령 (초·중·고)",
    bg: [
      "• <strong>미디어 이용:</strong> 청소년 84.1%가 하루 1시간 이상 숏폼 콘텐츠 소비.",
      "• <strong>수면 부족:</strong> 야간 스마트폰 사용으로 인한 수면 장애 호소율 상승."
    ],
    timeTitle: "주말 체험 및 1박 2일 디지털 디톡스 캠프",
    timeDesc: "자연 환경 속 스마트폰 반납형 체험 수련시설 활용.",
    methodTitle: "디지털 디톡스 챌린지 및 영상 비평",
    methodDesc: "스스로 스마트폰 사용 시간을 줄이는 또래 인증 챌린지.",
    warning: "• <strong>강제적인 기기 압수 방식 지양:</strong> 강압적 통제는 반발심을 유발하므로 자발적 규칙 제정이 중요."
  }
};

// [API Endpoint] 기획 보고서 생성 API
app.post('/api/generate-proposal', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: '유효한 프롬프트를 입력해주세요.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. GEMINI_API_KEY가 설정되어 있는 경우 실제 AI API 호출
    if (apiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `당신은 청소년 지도사 기획 파트너 AI입니다. KOSIS 실태조사 데이터를 기반으로 다음 요구사항에 맞는 기획안을 JSON 형식으로 작성해 주세요.
                요구사항: "${prompt}"
                
                반드시 다음 JSON 규격으로만 응답해 주세요 (마크다운 없이 순수 JSON):
                {
                  "title": "기획안 제목",
                  "target": "대상 청소년",
                  "bg": ["• <strong>항목1:</strong> 내용", "• <strong>항목2:</strong> 내용"],
                  "timeTitle": "추천 시간/장소 제목",
                  "timeDesc": "상세 설명",
                  "methodTitle": "추천 방식 제목",
                  "methodDesc": "상세 설명",
                  "warning": "• <strong>비추천 요인:</strong> 내용"
                }`
              }]
            }]
          })
        });

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (rawText) {
          // 마크다운 문법 정리 후 JSON 파싱
          const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsedData = JSON.parse(cleanedJson);
          return res.json({ success: true, source: 'ai', data: parsedData });
        }
      } catch (aiError) {
        console.warn('AI API 호출 실패, 폴백 데이터로 전환합니다:', aiError.message);
      }
    }

    // 2. API 키가 없거나 AI 호출 실패 시 규칙 기반 스마트 폴백 응답
    let selectedKey = '도박';
    if (prompt.includes('돌봄') || prompt.includes('나홀로') || prompt.includes('초등')) {
      selectedKey = '돌봄';
    } else if (prompt.includes('숏폼') || prompt.includes('미디어') || prompt.includes('스마트폰')) {
      selectedKey = '숏폼';
    }

    const fallbackResult = mockDataStore[selectedKey];

    // 입력받은 프롬프트를 반영하여 제목 가공
    if (!prompt.includes('도박') && !prompt.includes('돌봄') && !prompt.includes('숏폼')) {
      fallbackResult.title = `"${prompt.slice(0, 15)}..." 맞춤형 청소년 프로그램 기획안`;
    }

    return res.json({
      success: true,
      source: 'rule-engine',
      data: fallbackResult
    });

  } catch (error) {
    console.error('서버 에러:', error);
    res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(`🚀 청소년 지원 시스템 백엔드 서버가 시작되었습니다.`);
  console.log(`🔗 로컬 서버 주소: http://localhost:${PORT}`);
  console.log(`===========================================`);
});