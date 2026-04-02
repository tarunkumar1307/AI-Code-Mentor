import { useState } from "react";
import Editor from "@monaco-editor/react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Upload, Code2 } from "lucide-react";
import { analyzeCode, type AnalysisResult } from "@/lib/api";
import { ResultsView } from "@/components/ResultsView";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
];

const PLACEHOLDER_CODE = `// Paste your code here and click "Analyze My Code"
// Example:
function calculateTotal(items) {
  var total = 0
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price * items[i].qty
  }
  return total
}`;

export function EditorPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState(PLACEHOLDER_CODE);
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await analyzeCode(code, language);
      setResult(analysis);
    } catch (err: unknown) {
      console.error(err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { status?: number; data?: { error?: string } } };
        if (axiosErr.response?.status === 429) {
          setError(axiosErr.response.data?.error || "Rate limit reached. Please wait a minute and try again.");
        } else {
          setError(axiosErr.response?.data?.error || "Failed to analyze code. Please try again.");
        }
      } else {
        setError("Failed to analyze code. Make sure the backend is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCode(content);

      const ext = file.name.split('.').pop()?.toLowerCase();
      const extMap: Record<string, string> = {
        js: "javascript", ts: "typescript", py: "python",
        java: "java", cpp: "cpp", c: "c", cs: "csharp",
        go: "go", rs: "rust", php: "php", rb: "ruby",
        html: "html", css: "css",
      };
      if (ext && extMap[ext]) setLanguage(extMap[ext]);
    };
    reader.readAsText(file);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Analyze Your Code
        </h1>
        <p className="text-muted-foreground">
          Paste your code below and get instant AI-powered feedback on quality, readability, and what to learn next.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,auto]">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center gap-3">
              <Code2 className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base">Code Editor</CardTitle>
                <CardDescription>Paste or type your code</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-36"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </Select>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                <input
                  type="file"
                  className="hidden"
                  accept=".js,.ts,.py,.java,.cpp,.c,.cs,.go,.rs,.php,.rb,.html,.css,.txt"
                  onChange={handleFileUpload}
                />
                <Upload className="h-4 w-4" />
                Upload
              </label>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-t border-border">
              <Editor
                height="400px"
                language={language}
                value={code}
                onChange={(value) => setCode(value || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  padding: { top: 16, bottom: 16 },
                  renderLineHighlight: "gutter",
                  automaticLayout: true,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 lg:w-56">
          <Button
            size="lg"
            className="gap-2 text-base"
            onClick={handleAnalyze}
            disabled={loading || !code.trim()}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
            {loading ? "Analyzing..." : "Analyze My Code"}
          </Button>

          <Card className="flex-1">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Supported Languages
              </p>
              <div className="flex flex-wrap gap-1.5">
                {LANGUAGES.slice(0, 8).map((lang) => (
                  <Badge
                    key={lang.value}
                    variant={language === lang.value ? "default" : "secondary"}
                    className="cursor-pointer text-xs"
                    onClick={() => setLanguage(lang.value)}
                  >
                    {lang.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {result && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/report/${result.id}`)}
            >
              View Full Report
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div className="text-center">
                <p className="font-medium">Analyzing your code...</p>
                <p className="text-sm text-muted-foreground">
                  Our AI mentor is reviewing your code quality, readability, and structure.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {result && !loading && <ResultsView result={result} code={code} />}
    </div>
  );
}
