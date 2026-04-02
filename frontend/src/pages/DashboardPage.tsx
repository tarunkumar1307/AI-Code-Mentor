import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreRing } from "@/components/ScoreRing";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  BarChart3, TrendingUp, FileCode2, AlertTriangle,
  ArrowRight, Trophy
} from "lucide-react";
import { getDashboardStats, getReports, type DashboardStats, type ReportSummary } from "@/lib/api";

const CHART_COLORS = ["#a78bfa", "#60a5fa", "#34d399", "#fbbf24", "#f87171", "#f472b6", "#818cf8"];

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, r] = await Promise.all([getDashboardStats(), getReports()]);
        setStats(s);
        setReports(r);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (!stats || stats.totalReports === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-6 py-20">
          <div className="rounded-full bg-muted p-6">
            <BarChart3 className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">No Data Yet</h2>
            <p className="text-muted-foreground max-w-md">
              Submit your first code analysis to start tracking your progress. Your scores, trends, and weak areas will appear here.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Analyze Code <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const trendData = stats.recentTrend.map((t, i) => ({
    name: `#${i + 1}`,
    readability: t.readability_score,
    maintainability: t.maintainability_score,
    overall: t.overall_score,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Your Progress</h1>
        <p className="text-muted-foreground">
          Track your code quality improvement over time.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-primary/10 p-3">
              <FileCode2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalReports}</p>
              <p className="text-xs text-muted-foreground">Submissions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-emerald-500/10 p-3">
              <Trophy className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.averageScores.avg_overall || 0}</p>
              <p className="text-xs text-muted-foreground">Avg Overall Score</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-blue-500/10 p-3">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.averageScores.avg_readability || 0}</p>
              <p className="text-xs text-muted-foreground">Avg Readability</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-amber-500/10 p-3">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.weakAreas.length}</p>
              <p className="text-xs text-muted-foreground">Areas to Improve</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Average Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Average Scores</CardTitle>
          <CardDescription>Your average performance across all submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-8 py-4 sm:gap-12">
            <ScoreRing score={stats.averageScores.avg_overall || 0} label="Overall" size={140} />
            <ScoreRing score={stats.averageScores.avg_readability || 0} label="Readability" />
            <ScoreRing score={stats.averageScores.avg_maintainability || 0} label="Maintainability" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        {/* Score Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Score Trend</CardTitle>
            <CardDescription>How your scores change over submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {trendData.length > 1 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      borderColor: "var(--color-border)",
                      borderRadius: "8px",
                      color: "var(--color-foreground)",
                    }}
                  />
                  <Line type="monotone" dataKey="overall" stroke="#a78bfa" strokeWidth={2} dot={{ r: 4 }} name="Overall" />
                  <Line type="monotone" dataKey="readability" stroke="#60a5fa" strokeWidth={2} dot={{ r: 4 }} name="Readability" />
                  <Line type="monotone" dataKey="maintainability" stroke="#34d399" strokeWidth={2} dot={{ r: 4 }} name="Maintainability" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Submit more code to see your trend chart.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Language Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Languages Used</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.languageBreakdown.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={stats.languageBreakdown}
                      dataKey="count"
                      nameKey="language"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      strokeWidth={2}
                    >
                      {stats.languageBreakdown.map((_, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        borderColor: "var(--color-border)",
                        borderRadius: "8px",
                        color: "var(--color-foreground)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2">
                  {stats.languageBreakdown.map((lang, i) => (
                    <Badge key={lang.language} variant="secondary" className="gap-1.5">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      {lang.language} ({lang.count})
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Weak Areas */}
      {stats.weakAreas.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <CardTitle>Areas to Improve</CardTitle>
            </div>
            <CardDescription>Concepts where you score lowest — focus your practice here</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.weakAreas.map((area, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{area.name}</span>
                  <span className="text-sm font-semibold">{area.averageScore}/100</span>
                </div>
                <Progress
                  value={area.averageScore}
                  indicatorClassName={
                    area.averageScore >= 80 ? "bg-emerald-500"
                    : area.averageScore >= 60 ? "bg-amber-500"
                    : "bg-red-500"
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Reports */}
      {reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reports.slice(0, 10).map((report) => (
                <Link
                  key={report.id}
                  to={`/report/${report.id}`}
                  className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{report.language}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">
                      Score: {Math.round(report.overall_score)}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
