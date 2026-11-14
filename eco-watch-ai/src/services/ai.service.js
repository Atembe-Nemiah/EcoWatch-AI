/**
 * EcoWatch AI — AI Analysis Service (Gemini)
 */
const fs = require('fs');
const path = require('path');

const ALLOWED_CATEGORIES = [
    'organic', 'plastic', 'paper', 'metal',
    'glass', 'mixed', 'hazardous', 'unknown'
];

const ALLOWED_CONFIDENCE = ['low', 'medium', 'high'];

const ALLOWED_ROUTES = [
    'composting', 'mechanical_recycling', 'paper_recycling',
    'metal_recovery', 'glass_recycling', 'energy_recovery',
    'specialist_handling', 'manual_inspection'
];

const ANALYSIS_PROMPT = `You are an assistant for an environmental waste-reporting application. Review the supplied image and description. Return only valid JSON matching this schema: { category, visible_evidence (array), confidence_label (low/medium/high), uncertainty (string), suggested_routes (array from: composting, mechanical_recycling, paper_recycling, metal_recovery, glass_recycling, energy_recovery, specialist_handling, manual_inspection), human_review_required (always true) }. Classify only what is visible. Do not claim chemical composition or safety.`;

/**
 * Analyse a waste report using the Gemini API.
 * @param {string} imagePath — path to the uploaded image file
 * @param {string} description — user-supplied description of the waste
 * @returns {object} analysis result
 */
async function analyseReport(imagePath, description) {
    const apiKey = process.env.AI_API_KEY;

    // If no API key configured, return gracefully
    if (!apiKey || apiKey === 'your-api-key-here' || apiKey === 'placeholder') {
        return { status: 'unavailable', message: 'AI service not configured' };
    }

    try {
        // Read image and encode to base64
        let imageBase64 = null;
        let mimeType = 'image/jpeg';

        if (imagePath && fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            imageBase64 = imageBuffer.toString('base64');

            const ext = path.extname(imagePath).toLowerCase();
            const mimeMap = { '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };
            mimeType = mimeMap[ext] || 'image/jpeg';
        }

        const userContent = `Description: ${description}`;

        // Build request parts
        const parts = [];
        parts.push({ text: ANALYSIS_PROMPT });
        parts.push({ text: userContent });

        if (imageBase64) {
            parts.push({
                inline_data: {
                    mime_type: mimeType,
                    data: imageBase64
                }
            });
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 1024
                }
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Gemini API error (${response.status}): ${errorBody.substring(0, 200)}`);
        }

        const result = await response.json();

        // Extract text from response
        const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textContent) {
            throw new Error('No text content in Gemini response');
        }

        // Parse JSON from the response (strip markdown fences if present)
        const jsonStr = textContent.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        const analysis = JSON.parse(jsonStr);

        // Validate against allowlists
        const validated = {
            category: ALLOWED_CATEGORIES.includes(analysis.category) ? analysis.category : 'unknown',
            visible_evidence: Array.isArray(analysis.visible_evidence) ? analysis.visible_evidence.map(String) : [],
            confidence_label: ALLOWED_CONFIDENCE.includes(analysis.confidence_label) ? analysis.confidence_label : 'low',
            uncertainty: typeof analysis.uncertainty === 'string' ? analysis.uncertainty : 'Uncertainty information not provided',
            suggested_routes: Array.isArray(analysis.suggested_routes)
                ? analysis.suggested_routes.filter(r => ALLOWED_ROUTES.includes(r))
                : [],
            human_review_required: true // Always true
        };

        return { status: 'completed', ...validated };
    } catch (err) {
        return { status: 'failed', error: err.message };
    }
}

module.exports = { analyseReport, ALLOWED_CATEGORIES, ALLOWED_ROUTES };
