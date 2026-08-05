export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { prompt } = req.body;
        const apiKey = process.env.GEMINI_API_KEY; // Vercel 환경 변수에서 가져옴

        if (!apiKey) {
            return res.status(500).json({ error: 'API Key is not configured on Vercel.' });
        }

        // Vercel 서버 환경에서 안전하게 Google GenAI 호출
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey: apiKey });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return res.status(200).json({ text: response.text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}