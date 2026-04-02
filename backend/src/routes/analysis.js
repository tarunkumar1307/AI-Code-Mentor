const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { analyzeCode } = require('../services/aiService');
const { getDb } = require('../db/database');

const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const lang = language || 'javascript';
    const analysis = await analyzeCode(code, lang);
    const id = uuidv4();

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO reports (id, code, language, readability_score, maintainability_score, overall_score, issues, suggestions, explanation, concepts, ai_feedback)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      code,
      lang,
      analysis.readability_score || 0,
      analysis.maintainability_score || 0,
      analysis.overall_score || 0,
      JSON.stringify(analysis.issues || []),
      JSON.stringify(analysis.suggestions || []),
      analysis.explanation || '',
      JSON.stringify(analysis.concepts || []),
      JSON.stringify({
        what_to_learn_next: analysis.what_to_learn_next || [],
      })
    );

    res.json({
      id,
      ...analysis,
      language: lang,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analysis error:', error.message);
    if (error.message === 'RATE_LIMITED') {
      return res.status(429).json({
        error: 'Gemini API rate limit reached. Your free tier quota may be exhausted for today. Please wait a minute and try again, or generate a new API key at https://aistudio.google.com/apikey',
      });
    }
    res.status(500).json({ error: 'Failed to analyze code. Please try again.' });
  }
});

module.exports = router;
