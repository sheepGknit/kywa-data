const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function scrapeEYouth() {
    console.log("🔍 e-청소년 프로그램 데이터 크롤링 시작...");
    
    const url = 'https://www.youth.go.kr/ypos/programs/search.do'; 
    let scrapedPrograms = [];
    
    // 💡 크롤링할 최대 페이지 수를 설정합니다. (원하는 만큼 수정 가능)
    const MAX_PAGES = 10; 

    try {
        for (let i = 1; i <= MAX_PAGES; i++) {
            console.log(`⏳ ${i}페이지 크롤링 중...`);
            
            // POST 방식으로 페이지 번호(pageIndex)를 바꿔가며 요청합니다.
            const response = await axios.post(url, `pageIndex=${i}`, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    // 사람(일반 크롬 브라우저)이 접속하는 것처럼 위장
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Referer': 'https://www.youth.go.kr/ypos/programs/search.do',
                    'Origin': 'https://www.youth.go.kr'
                },
                // 리다이렉트가 발생하더라도 최대 5번까지만 따라가고 에러를 방지
                maxRedirects: 5 
            });
            const $ = cheerio.load(response.data);
            const list = $('.act-name-box dl');
            
            // 만약 해당 페이지에 데이터가 하나도 없다면 마지막 페이지에 도달한 것이므로 중단합니다.
            if (list.length === 0) {
                console.log(`ℹ️ ${i}페이지에 데이터가 없습니다. 크롤링을 종료합니다.`);
                break;
            }

            // 프로그램 리스트 순회 및 데이터 추출
            list.each((index, element) => {
                const titleElement = $(element).find('dt');
                const programType = titleElement.find('.label-area').text().trim(); 
                const activityName = titleElement.find('a').text().trim(); 

                let facilityName = "";
                let sidoNm = "";
                let sggNm = "";

                $(element).find('dd').each((_, ddElem) => {
                    // 연속된 공백을 하나로 압축
                    const text = $(ddElem).text().replace(/\s+/g, ' ').trim(); 
                    
                    if (text.includes('기관명 :')) {
                        facilityName = text.replace('기관명 :', '').trim();
                    } 
                    else if (text.includes('지역 :')) {
                        const regionFull = text.replace('지역 :', '').trim();
                        const regionParts = regionFull.split(' '); 
                        
                        if (regionParts.length > 0) sidoNm = regionParts[0]; 
                        
                        if (regionParts.length >= 2) {
                            // "성남시 분당구" 처럼 구가 띄어쓰기 되어있을 경우 다시 합침
                            sggNm = regionParts.slice(1).join(' '); 
                        } else {
                            sggNm = "전체"; 
                        }
                    }
                });

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
            
            // 💡 대상 서버(e-청소년)에 과부하를 주어 IP가 차단되는 것을 막기 위해 1페이지마다 1초씩 대기합니다.
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // 결과물을 프로젝트의 data/programs.json 파일로 덮어쓰기 저장
        // (scripts 폴더의 상위 폴더(..)에 있는 data 폴더를 바라봄)
        const outputPath = path.join(__dirname, '../data/programs.json');
        
        // 만약 data 폴더가 없다면 생성 (안전장치)
        if (!fs.existsSync(path.dirname(outputPath))) {
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        }
        
        fs.writeFileSync(outputPath, JSON.stringify(scrapedPrograms, null, 2), 'utf-8');
        
        console.log(`✅ 성공적으로 총 ${scrapedPrograms.length}개의 프로그램 데이터를 갱신했습니다!`);

    } catch (error) {
        console.error("❌ 크롤링 중 오류 발생:", error.message);
        process.exit(1); 
    }
}

scrapeEYouth();
