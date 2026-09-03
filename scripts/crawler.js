const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function scrapeEYouth() {
    console.log("🔍 e-청소년 프로그램 데이터 크롤링 시작...");
    
    const url = 'https://www.youth.go.kr/ypos/programs/search.do'; 
    let scrapedPrograms = [];
    const MAX_PAGES = 10; 

    try {
        // 🌟 1. 봇 방어 시스템 우회: 초기 접속으로 출입증(쿠키) 발급받기
        console.log("🔑 서버에서 세션 권한(쿠키)을 발급받는 중...");
        const initialRes = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            }
        });
        
        // 서버가 내려준 쿠키(Set-Cookie) 추출 후 문자열로 조립
        const rawCookies = initialRes.headers['set-cookie'];
        const cookieHeader = rawCookies ? rawCookies.map(c => c.split(';')[0]).join('; ') : '';
        console.log("✅ 쿠키 발급 완료, 데이터 수집을 시작합니다.");

        // 🌟 2. 발급받은 쿠키를 들고 페이지 순회하며 크롤링
        for (let i = 1; i <= MAX_PAGES; i++) {
            console.log(`⏳ ${i}페이지 크롤링 중...`);
            
            const response = await axios.post(url, `pageIndex=${i}`, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Referer': 'https://www.youth.go.kr/ypos/programs/search.do',
                    'Origin': 'https://www.youth.go.kr',
                    'Cookie': cookieHeader // 👈 발급받은 신분증(쿠키)을 함께 제출!
                },
                maxRedirects: 5 
            });
            
            const $ = cheerio.load(response.data);
            const list = $('.act-name-box dl');
            
            if (list.length === 0) {
                console.log(`ℹ️ ${i}페이지에 데이터가 없습니다. 크롤링을 종료합니다.`);
                break;
            }

            list.each((index, element) => {
                const titleElement = $(element).find('dt');
                const programType = titleElement.find('.label-area').text().trim(); 
                const activityName = titleElement.find('a').text().trim(); 

                let facilityName = "";
                let sidoNm = "";
                let sggNm = "";

                $(element).find('dd').each((_, ddElem) => {
                    const text = $(ddElem).text().replace(/\s+/g, ' ').trim(); 
                    
                    if (text.includes('기관명 :')) {
                        facilityName = text.replace('기관명 :', '').trim();
                    } 
                    else if (text.includes('지역 :')) {
                        const regionFull = text.replace('지역 :', '').trim();
                        const regionParts = regionFull.split(' '); 
                        
                        if (regionParts.length > 0) sidoNm = regionParts[0]; 
                        
                        if (regionParts.length >= 2) {
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
            
            // 1초씩 쉬어주기 (서버 과부하 방지)
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const outputPath = path.join(__dirname, '../data/programs.json');
        
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
