export default async function handler(req, res) {
    // 1. 프론트엔드에서 보낸 파라미터 받기 (예: statId, itemCode)
    const { statId, itemCode } = req.query;

    // 2. Vercel 환경변수에 등록한 KOSIS API 키 불러오기 (보안 유지)
    const API_KEY = process.env.KOSIS_API_KEY; 

    // 3. 실제 KOSIS API 요청 URL 조립
	const url = 'https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=NjVkNWExMTM0MDIwYWMwNzFhZTJhNTMxMWVhYmM1MjY=&itmId=T10+&objL1=1+&objL2=ALL&objL3=000+040+050+070+100+120+130+150+160+180+190+210+230+260+280+310+330+340+360+380+410+430+440+&objL4=&objL5=&objL6=&objL7=&objL8=&format=json&jsonVD=Y&prdSe=Y&newEstPrdCnt=3&orgId=101&tblId=DT_1BPA001'

    try {
        // 백엔드 환경(Vercel 서버)에서 KOSIS로 요청을 보내므로 CORS 에러가 발생하지 않음
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`KOSIS API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 4. 성공적으로 받아온 데이터를 프론트엔드로 전달
        res.status(200).json(data);
    } catch (error) {
        console.error("API Proxy Error:", error);
        res.status(500).json({ message: "데이터를 불러오는 중 오류가 발생했습니다." });
    }
}