const express = require('express');
const { getDb } = require('../db/database');

const router = express.Router();

router.get('/reports', (_req, res) => {
  try {
    const db = getDb();
    const reports = db.prepare(`
      SELECT id, language, readability_score, maintainability_score, overall_score, concepts, created_at
      FROM reports ORDER BY created_at DESC LIMIT 50
    `).all();

    const parsed = reports.map((r) => ({
      ...r,
      concepts: JSON.parse(r.concepts || '[]'),
    }));

    res.json(parsed);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

router.get('/reports/:id', (req, res) => {
  try {
    const db = getDb();
    const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({
      ...report,
      issues: JSON.parse(report.issues || '[]'),
      suggestions: JSON.parse(report.suggestions || '[]'),
      concepts: JSON.parse(report.concepts || '[]'),
      ai_feedback: JSON.parse(report.ai_feedback || '{}'),
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

router.get('/dashboard/stats', (_req, res) => {
  try {
    const db = getDb();

    const totalReports = db.prepare('SELECT COUNT(*) as count FROM reports').get();
    const avgScores = db.prepare(`
      SELECT 
        ROUND(AVG(readability_score), 1) as avg_readability,
        ROUND(AVG(maintainability_score), 1) as avg_maintainability,
        ROUND(AVG(overall_score), 1) as avg_overall
      FROM reports
    `).get();

    const recentTrend = db.prepare(`
      SELECT 
        readability_score, maintainability_score, overall_score, created_at
      FROM reports ORDER BY created_at ASC LIMIT 20
    `).all();

    const languageBreakdown = db.prepare(`
      SELECT language, COUNT(*) as count
      FROM reports GROUP BY language ORDER BY count DESC
    `).all();

    const allConcepts = db.prepare('SELECT concepts FROM reports ORDER BY created_at DESC LIMIT 10').all();
    const conceptScores = {};
    allConcepts.forEach((row) => {
      const concepts = JSON.parse(row.concepts || '[]');
      concepts.forEach((c) => {
        if (!conceptScores[c.name]) {
          conceptScores[c.name] = { total: 0, count: 0 };
        }
        conceptScores[c.name].total += c.score;
        conceptScores[c.name].count += 1;
      });
    });
    const weakAreas = Object.entries(conceptScores)
      .map(([name, data]) => ({
        name,
        averageScore: Math.round(data.total / data.count),
      }))
      .sort((a, b) => a.averageScore - b.averageScore)
      .slice(0, 5);

    res.json({
      totalReports: totalReports.count,
      averageScores: avgScores,
      recentTrend,
      languageBreakdown,
      weakAreas,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;
