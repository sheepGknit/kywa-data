import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: '허용되지 않은 메서드입니다.' });
    }

    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: '프롬프트가 누락되었습니다.' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return res.status(200).json({ result: response.text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        return res.status(500).json({ error: 'AI 응답 생성에 실패했습니다.' });
    }
}