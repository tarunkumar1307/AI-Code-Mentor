const { GoogleGenerativeAI } = require('@google/generative-ai');

const MODELS = ['gemini-flash-latest', 'gemini-2.0-flash', 'gemini-1.5-flash'];
const MAX_RETRIES = 3;

let genAI;

function getGenAI() {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set. Please add it to your .env file.');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

const SYSTEM_PROMPT = `You are CodeMentor AI, a friendly and encouraging code mentor for beginner programmers. 
Your job is to analyze code and provide helpful, educational feedback.

When analyzing code, you MUST return a valid JSON object with exactly this structure:
{
  "readability_score": <number 0-100>,
  "maintainability_score": <number 0-100>,
  "overall_score": <number 0-100>,
  "issues": [
    {
      "severity": "error" | "warning" | "info",
      "title": "<short title>",
      "description": "<beginner-friendly explanation of what's wrong>",
      "line": <line number or null>,
      "suggestion": "<how to fix it with example>"
    }
  ],
  "suggestions": [
    "<actionable improvement suggestion>"
  ],
  "explanation": "<2-3 paragraph overall explanation of code quality, written like a friendly teacher speaking to a student>",
  "concepts": [
    {
      "name": "<concept name like 'Variable Naming', 'Error Handling', 'DRY Principle'>",
      "score": <0-100 how well the student demonstrates this concept>,
      "tip": "<one sentence advice>"
    }
  ],
  "what_to_learn_next": [
    "<topic or concept the student should study next>"
  ]
}

Scoring guidelines:
- readability_score: How easy is the code to read? (naming, formatting, comments, structure)
- maintainability_score: How easy would it be to modify/extend? (modularity, coupling, complexity)
- overall_score: Weighted average considering both scores and correctness

Be encouraging but honest. Explain issues as if teaching a student who is eager to learn.
Always provide concrete examples in suggestions.
RETURN ONLY THE JSON OBJECT, no markdown formatting, no code fences.`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tryModel(modelName, prompt) {
  const model = getGenAI().getGenerativeModel({ model: modelName });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2000,
    },
  });
  return result.response.text() || '{}';
}

async function analyzeCode(code, language) {
  const prompt = `${SYSTEM_PROMPT}\n\nPlease analyze the following ${language} code:\n\n${code}`;

  let lastError;

  for (const modelName of MODELS) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        console.log(`Trying ${modelName} (attempt ${attempt + 1}/${MAX_RETRIES})...`);
        const content = await tryModel(modelName, prompt);
        const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        console.log(`Success with ${modelName}`);
        return JSON.parse(cleaned);
      } catch (err) {
        lastError = err;

        if (err.status === 429) {
          const retryMatch = err.message?.match(/retry in ([\d.]+)s/i);
          const waitSec = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : (attempt + 1) * 15;

          if (attempt < MAX_RETRIES - 1) {
            console.log(`Rate limited on ${modelName}, retrying in ${waitSec}s...`);
            await sleep(waitSec * 1000);
            continue;
          }
          console.log(`Rate limited on ${modelName}, trying next model...`);
          break;
        }

        console.error(`Error with ${modelName}:`, err.message);
        break;
      }
    }
  }

  console.error('All models exhausted. Last error:', lastError?.message);
  throw new Error('RATE_LIMITED');
}

module.exports = { analyzeCode };
