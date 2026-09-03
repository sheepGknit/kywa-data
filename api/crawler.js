const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function scrapeEYouth() {
    console.log("🔍 e-청소년 프로그램 데이터 크롤링 시작...");
    
    // e-청소년 활동 검색 URL (필요에 따라 쿼리파라미터 추가)
    const url = 'https://www.youth.go.kr/ypos/programs/search.do'; 
    let scrapedPrograms = [];

    try {
        // 사이트에 접속해서 HTML을 가져옵니다.
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // ul 밑에 있는 모든 li(프로그램 리스트)를 순회합니다.
        $('.act-name-box dl').each((index, element) => {
            
            // 1. 프로그램명 및 유형 추출
            const titleElement = $(element).find('dt');
            const programType = titleElement.find('.label-area').text().trim(); // 예: "문화예술"
            const activityName = titleElement.find('a').text().trim(); // 예: "청소년문화예술교육 1박2일형_중등형"

            // 2. 기본 정보 초기화
            let facilityName = "";
            let sidoNm = "";
            let sggNm = "";

            // 3. dd 태그들을 순회하며 라벨(strong)에 맞춰 데이터 추출
            $(element).find('dd').each((i, ddElem) => {
                const text = $(ddElem).text().replace(/\s+/g, ' ').trim(); // 연속된 공백(엔터 등)을 하나로 압축
                
                if (text.includes('기관명 :')) {
                    facilityName = text.replace('기관명 :', '').trim();
                } 
                else if (text.includes('지역 :')) {
                    // 예: "지역 : 충청남도 논산시" -> "충청남도 논산시"
                    const regionFull = text.replace('지역 :', '').trim();
                    const regionParts = regionFull.split(' '); // 공백으로 자르기
                    
                    if (regionParts.length > 0) sidoNm = regionParts[0]; // 충청남도
                    
                    if (regionParts.length >= 2) {
                        // "성남시 분당구" 처럼 구가 띄어쓰기 되어있을 경우를 대비해 2번째 이후 단어는 다시 합침
                        sggNm = regionParts.slice(1).join(' '); // 논산시
                    } else {
                        sggNm = "전체"; // 구 정보가 없을 때의 안전장치
                    }
                }
            });

            // 빈 데이터가 아니라면 배열에 추가
            if (activityName) {
                scrapedPrograms.push({
                    activityName,
                    facilityName,
                    sidoNm,
                    sggNm,
                    programType
                });
            }
        });

        // 결과물을 data/programs.json 파일로 덮어쓰기 저장
        const outputPath = path.join(__dirname, '../data/programs.json');
        fs.writeFileSync(outputPath, JSON.stringify(scrapedPrograms, null, 2), 'utf-8');
        
        console.log(`✅ 성공적으로 ${scrapedPrograms.length}개의 프로그램 데이터를 추출하고 저장했습니다!`);

    } catch (error) {
        console.error("❌ 크롤링 중 오류 발생:", error.message);
        process.exit(1); 
    }
}

scrapeEYouth();
