import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

export interface Issue {
  severity: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  line: number | null;
  suggestion: string;
}

export interface Concept {
  name: string;
  score: number;
  tip: string;
}

export interface AnalysisResult {
  id: string;
  readability_score: number;
  maintainability_score: number;
  overall_score: number;
  issues: Issue[];
  suggestions: string[];
  explanation: string;
  concepts: Concept[];
  what_to_learn_next: string[];
  language: string;
  created_at: string;
}

export interface ReportSummary {
  id: string;
  language: string;
  readability_score: number;
  maintainability_score: number;
  overall_score: number;
  concepts: Concept[];
  created_at: string;
}

export interface DashboardStats {
  totalReports: number;
  averageScores: {
    avg_readability: number;
    avg_maintainability: number;
    avg_overall: number;
  };
  recentTrend: {
    readability_score: number;
    maintainability_score: number;
    overall_score: number;
    created_at: string;
  }[];
  languageBreakdown: { language: string; count: number }[];
  weakAreas: { name: string; averageScore: number }[];
}

export async function analyzeCode(code: string, language: string): Promise<AnalysisResult> {
  const { data } = await api.post('/analyze', { code, language });
  return data;
}

export async function getReports(): Promise<ReportSummary[]> {
  const { data } = await api.get('/reports');
  return data;
}

export async function getReport(id: string): Promise<AnalysisResult & { code: string; ai_feedback: { what_to_learn_next: string[] } }> {
  const { data } = await api.get(`/reports/${id}`);
  return data;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get('/dashboard/stats');
  return data;
}
