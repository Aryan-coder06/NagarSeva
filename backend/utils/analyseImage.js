const DEFAULT_MODEL_CANDIDATES = [
    process.env.GEMINI_MODEL,
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
].filter(Boolean);

async function callGeminiModel({ model, prompt, mimeType, imageBase64 }) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: prompt
                        },
                        {
                            inlineData: {
                                mimeType,
                                data: imageBase64
                            }
                        }
                    ]
                }
            ],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.2
            }
        })
    });

    const body = await response.json();
    return { response, body };
}

async function analyzeImage(imageUrl) {
    const prompt = `
Analyze the uploaded image and classify it into one of the following fixed civic categories:

1. Roads & Transport  
2. Street Lighting  
3. Garbage & Sanitation  
4. Water Supply & Drainage  
5. Electricity  
6. Public Safety  
7. Other

Return the result in structured JSON format:
{
  "category": "<one of the fixed categories above>",
  "issueType": "<specific issue subtype such as pothole, broken street light, overflowed garbage bin>",
  "title": "<a concise title, max 10 words>",
  "severity": "<Low|Medium|High|Critical>",
  "urgency": "<Scheduled|Soon|Urgent|Immediate>",
  "suggestedDepartment": "<authority team best suited to resolve it>",
  "publicSummary": "<one sentence citizen-facing summary>",
  "authoritySummary": "<one sentence operations summary for an admin desk>",
  "recommendedAction": "<one sentence next best action>",
  "confidence": <number between 0 and 1>
}
Only respond with the raw JSON object. Do not use Markdown formatting or triple backticks.
`;

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
        throw new Error(`Failed to fetch issue image: ${imageResponse.status}`);
    }

    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const imageBase64 = imageBuffer.toString('base64');
    let lastErrorBody = null;

    for (const model of DEFAULT_MODEL_CANDIDATES) {
        const { response, body } = await callGeminiModel({ model, prompt, mimeType, imageBase64 });
        const message = body.candidates?.[0]?.content?.parts?.[0]?.text;

        if (response.ok && message) {
            try {
                const result = JSON.parse(message);
                return result;
            } catch (error) {
                console.error(`Error parsing Gemini response for model ${model}:`, error, body);
            }
        } else {
            lastErrorBody = body;
            const errorMessage = body?.error?.message || 'Unknown Gemini API error';
            console.warn(`Gemini model ${model} failed: ${errorMessage}`);

            if (response.status !== 404) {
                break;
            }
        }
    }

    console.error("Gemini response error:", lastErrorBody);
    return { category: "Other", issueType: "Unknown", title: "Unknown Issue" };
}

module.exports = analyzeImage;
