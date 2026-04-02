import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScoreRing } from "@/components/ScoreRing";
import {
  AlertTriangle, CheckCircle2, Info, Lightbulb,
  BookOpen, Target, TrendingUp
} from "lucide-react";
import type { AnalysisResult } from "@/lib/api";

interface ResultsViewProps {
  result: AnalysisResult;
  code?: string;
}

export function ResultsView({ result }: ResultsViewProps) {
  const severityIcon = {
    error: <AlertTriangle className="h-4 w-4 text-red-500" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    info: <Info className="h-4 w-4 text-blue-500" />,
  };

  const severityBadge = {
    error: "error" as const,
    warning: "warning" as const,
    info: "secondary" as const,
  };

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>Score Overview</CardTitle>
          </div>
          <CardDescription>How your code measures up</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-8 py-4 sm:gap-12">
            <ScoreRing score={result.overall_score} label="Overall" size={140} />
            <ScoreRing score={result.readability_score} label="Readability" />
            <ScoreRing score={result.maintainability_score} label="Maintainability" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="feedback">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="feedback">AI Feedback</TabsTrigger>
          <TabsTrigger value="issues">
            Issues ({result.issues?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="concepts">Concepts</TabsTrigger>
          <TabsTrigger value="learn">What to Learn</TabsTrigger>
        </TabsList>

        {/* AI Feedback Tab */}
        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <CardTitle>AI Mentor Feedback</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {result.explanation?.split('\n').map((paragraph, i) => (
                  <p key={i} className="text-sm leading-relaxed text-foreground/90">
                    {paragraph}
                  </p>
                ))}
              </div>

              {result.suggestions && result.suggestions.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="flex items-center gap-2 text-sm font-semibold">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    Suggestions for Improvement
                  </h4>
                  <ul className="space-y-2">
                    {result.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span className="text-foreground/80">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues">
          <div className="space-y-3">
            {(!result.issues || result.issues.length === 0) ? (
              <Card>
                <CardContent className="flex items-center justify-center p-8">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                    <p className="font-medium">No issues found!</p>
                    <p className="text-sm text-muted-foreground">Your code looks clean.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              result.issues.map((issue, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {severityIcon[issue.severity]}
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{issue.title}</span>
                          <Badge variant={severityBadge[issue.severity]} className="text-xs">
                            {issue.severity}
                          </Badge>
                          {issue.line && (
                            <Badge variant="outline" className="text-xs">
                              Line {issue.line}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{issue.description}</p>
                        {issue.suggestion && (
                          <div className="mt-2 rounded-md bg-muted p-3">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Suggestion:</p>
                            <p className="text-sm font-mono">{issue.suggestion}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Concepts Tab */}
        <TabsContent value="concepts">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle>Concept Breakdown</CardTitle>
              </div>
              <CardDescription>How well you demonstrate each programming concept</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.concepts && result.concepts.length > 0 ? (
                result.concepts.map((concept, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{concept.name}</span>
                      <span className="text-sm font-semibold text-primary">{concept.score}/100</span>
                    </div>
                    <Progress
                      value={concept.score}
                      indicatorClassName={
                        concept.score >= 80
                          ? "bg-emerald-500"
                          : concept.score >= 60
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }
                    />
                    <p className="text-xs text-muted-foreground">{concept.tip}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No concept analysis available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* What to Learn Tab */}
        <TabsContent value="learn">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <CardTitle>What to Learn Next</CardTitle>
              </div>
              <CardDescription>Personalized learning recommendations based on your code</CardDescription>
            </CardHeader>
            <CardContent>
              {result.what_to_learn_next && result.what_to_learn_next.length > 0 ? (
                <ul className="space-y-3">
                  {result.what_to_learn_next.map((topic, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </div>
                      <span className="text-sm">{topic}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No specific recommendations at this time.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
