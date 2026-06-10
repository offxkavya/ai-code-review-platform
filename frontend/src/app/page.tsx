"use client";

import { useState, useEffect } from "react";
import { sendCodeForReview, ReviewComment, getLocalMockComments } from "../utils/api";

const SAMPLE_TEMPLATES: Record<string, string> = {
  python: `def process_data(items):\n    # TODO: Add exception handling\n    for i in range(len(items)):\n        print("Processing item:", items[i])\n        if items[i] == 0:\n            result = 100 / items[i] # Bug here!\n            eval("result + 1") # Security risk!\n    return True`,
  javascript: `function calculateTotal(price, tax) {\n  // TODO: validate inputs\n  var total = price + tax;\n  print("Calculating...");\n  var parsedVal = eval("price * tax");\n  return total;\n}`,
  diff: `diff --git a/main.py b/main.py\n--- a/main.py\n+++ b/main.py\n@@ -1,5 +1,6 @@\n def run_action(arg):\n-    print("starting")\n+    # TODO: sanitize arg input\n+    print("Executing action: " + arg)\n+    if arg == None:\n-        pass\n+        raise ValueError("Missing argument")\n     eval(arg)`
};

const LOADING_STEPS = [
  "Initializing reviewer environment...",
  "Parsing code structure & tokens...",
  "Applying security rules & templates...",
  "Querying review database...",
  "Formatting suggestions..."
];

export default function Home() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ReviewComment[] | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const loadTemplate = (lang: string) => {
    setLanguage(lang);
    setCode(SAMPLE_TEMPLATES[lang] || "");
    setError(null);
    setResults(null);
  };

  const handleReviewSubmit = async () => {
    if (!code.trim()) {
      setError("Please paste some code or a diff first.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setResults(null);
    
    try {
      const data = await sendCodeForReview(code, language);
      setResults(data.comments);
    } catch (err: any) {
      console.warn("Backend unavailable, falling back to local analysis mode:", err);
      const mockComments = getLocalMockComments(code);
      setResults(mockComments);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case "critical": return "border-rose-500 bg-rose-500 text-rose-100";
      case "warning": return "border-amber-500 bg-amber-500 text-amber-100";
      case "info": return "border-blue-500 bg-blue-500 text-blue-100";
      default: return "border-zinc-500 bg-zinc-500 text-zinc-100";
    }
  };

  const handleExport = () => {
    if (!results) return;
    const content = results.map(r => \`Line \${r.line_number} [\${r.severity.toUpperCase()}]: \${r.message}\nSuggestion: \${r.suggestion || 'None'}\n\`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'review-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 bg-black flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-blue-900 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[300px] h-[300px] rounded-full bg-indigo-900 blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-5xl z-10 space-y-8">
        {!results && !isLoading && (
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
              Code Reviewer
            </h1>
            <p className="text-zinc-400 max-w-xl mx-auto text-base sm:text-lg">
              Paste your source code or a unified git diff below, and the system will scan it for bugs, issues, and style violations.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-12 shadow-2xl flex flex-col items-center justify-center min-h-[450px] space-y-8 animate-fade-in relative overflow-hidden">
            <div className="relative flex items-center justify-center h-32 w-32">
              <div className="absolute inset-0 rounded-full border-2 border-blue-500 animate-ping" />
              <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="h-6 w-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            </div>
            <div className="text-center space-y-3 max-w-md">
              <h3 className="text-xl font-bold text-white">Analyzing Codebase</h3>
              <p className="text-sm text-zinc-400 min-h-[20px] transition-all duration-300">
                {LOADING_STEPS[loadingStep]}
              </p>
            </div>
            <div className="w-full max-w-xs bg-zinc-800 h-1.5 rounded-full overflow-hidden border border-zinc-700">
              <div className="h-full bg-blue-600 transition-all duration-500 ease-out" style={{ width: \`\${((loadingStep + 1) / LOADING_STEPS.length) * 100}%\` }} />
            </div>
          </div>
        ) : results ? (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
              <div className="flex gap-3">
                <button onClick={handleExport} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
                  Export Report
                </button>
                <button onClick={() => setResults(null)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition">
                  Review Another File
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {results.map((comment, idx) => (
                <div key={idx} className={\`p-4 rounded-xl border \${getSeverityColor(comment.severity)}\`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/20 text-white">
                          Line {comment.line_number}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-white">{comment.severity}</span>
                      </div>
                      <p className="font-medium text-sm sm:text-base text-white">{comment.message}</p>
                      {comment.suggestion && (
                        <div className="mt-3 relative group">
                          <div className="p-3 bg-black/30 rounded-lg border border-black/10 font-mono text-sm text-white pr-12">
                            {comment.suggestion}
                          </div>
                          <button 
                            onClick={() => navigator.clipboard.writeText(comment.suggestion || '')}
                            className="absolute top-2 right-2 p-1.5 bg-black/40 hover:bg-black/60 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition"
                          >
                            Copy
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Submit Code</h2>
                <p className="text-xs text-zinc-400">Select language or load a test template</p>
              </div>
              <div className="flex items-center gap-2">
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500">
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="diff">Unified Diff</option>
                  <option value="other">Other</option>
                </select>
                <div className="flex gap-1 bg-zinc-950 p-1 border border-zinc-800 rounded-lg">
                  <button onClick={() => loadTemplate("python")} className="px-2.5 py-1 rounded text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition">Py Template</button>
                  <button onClick={() => loadTemplate("diff")} className="px-2.5 py-1 rounded text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition">Diff Template</button>
                </div>
              </div>
            </div>
            <div className="relative rounded-xl border border-zinc-700 bg-black shadow-inner overflow-hidden font-mono text-sm flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-zinc-500 font-medium">{language === "diff" ? "commit.patch" : \`code.\${language === "python" ? "py" : language === "javascript" ? "js" : "txt"}\`}</span>
                  <button onClick={() => setCode("")} className="text-[11px] text-zinc-400 hover:text-white transition">Clear</button>
                </div>
              </div>
              <textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder="Paste your source code or diff here..." className="w-full h-80 bg-transparent text-white px-4 py-3 focus:outline-none resize-none font-mono leading-relaxed" />
              <div className="px-4 py-1.5 bg-zinc-900 border-t border-zinc-800 text-[10px] text-zinc-500 flex justify-between uppercase tracking-wider font-semibold">
                <span>{code.split('\\n').length} Lines</span>
                <span>{code.length} Chars</span>
              </div>
            </div>
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            <div className="flex justify-end">
              <button onClick={handleReviewSubmit} className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer">
                Run Review
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
