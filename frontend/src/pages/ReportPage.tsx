import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ResultsView } from "@/components/ResultsView";
import { getReport, type AnalysisResult } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

export function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<(AnalysisResult & { code: string; ai_feedback: { what_to_learn_next: string[] } }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const data = await getReport(id!);
        const merged: AnalysisResult & { code: string; ai_feedback: { what_to_learn_next: string[] } } = {
          ...data,
          what_to_learn_next: data.ai_feedback?.what_to_learn_next || data.what_to_learn_next || [],
        };
        setReport(merged);
      } catch {
        setError("Report not found.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-12">
            <p className="text-lg font-medium">{error || "Report not found"}</p>
            <Link to="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Editor
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex items-center gap-4">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Analysis Report</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(report.created_at).toLocaleString()} &middot; {report.language}
          </p>
        </div>
      </div>

      <ResultsView result={report} code={report.code} />
    </div>
  );
}
