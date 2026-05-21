"use client";

import { useState, useEffect } from "react";

const SAMPLE_TEMPLATES: Record<string, string> = {
  python: `def process_data(items):\n    # TODO: Add exception handling\n    for i in range(len(items)):\n        print("Processing item:", items[i])\n        if items[i] == 0:\n            result = 100 / items[i] # Bug here!\n            eval("result + 1") # Security risk!\n    return True`,
  javascript: `function calculateTotal(price, tax) {\n  // TODO: validate inputs\n  var total = price + tax;\n  print("Calculating...");\n  var parsedVal = eval("price * tax");\n  return total;\n}`,
  diff: `diff --git a/main.py b/main.py\n--- a/main.py\n+++ b/main.py\n@@ -1,5 +1,6 @@\n def run_action(arg):\n-    print("starting")\n+    # TODO: sanitize arg input\n+    print("Executing action: " + arg)\n+    if arg == None:\n-        pass\n+        raise ValueError("Missing argument")\n     eval(arg)`
};

const LOADING_STEPS = [
  "Initializing reviewer environment...",
  "Parsing code structure & tokens...",
  "Applying security rules & templates...",
  "Querying Claude LLM reviews...",
  "Formatting suggestions..."
];

export default function Home() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

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
  };

  const handleReviewSubmit = async () => {
    if (!code.trim()) {
      setError("Please paste some code or a diff first.");
      return;
    }
    setError(null);
    setIsLoading(true);
    
    // Simulate endpoint call for state verification
    setTimeout(() => {
      setIsLoading(false);
    }, 8000);
  };

  return (
    <div className="flex-1 bg-[#09090b] flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[300px] h-[300px] rounded-full bg-violet-500/10 blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-4xl z-10 space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Automate Your Code Reviews
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto text-base sm:text-lg">
            Paste your source code or a unified git diff below, and our AI reviewer will scan it for bugs, issues, and style violations.
          </p>
        </div>

        {isLoading ? (
          /* Premium Loading Screen */
          <div className="bg-[#18181b]/50 border border-[#27272a] rounded-2xl p-12 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center min-h-[450px] space-y-8 animate-fade-in relative overflow-hidden">
            {/* Spinning Radar Animation */}
            <div className="relative flex items-center justify-center h-32 w-32">
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500/10 animate-ping" />
              <div className="absolute h-24 w-24 rounded-full border border-indigo-500/30 animate-pulse bg-gradient-to-tr from-indigo-500/5 to-transparent" />
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <span className="h-6 w-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            </div>

            <div className="text-center space-y-3 max-w-md">
              <h3 className="text-xl font-bold text-zinc-100">Analyzing Codebase</h3>
              <p className="text-sm text-zinc-400 animate-pulse min-h-[20px] transition-all duration-300">
                {LOADING_STEPS[loadingStep]}
              </p>
            </div>

            {/* Micro progress-bar */}
            <div className="w-full max-w-xs bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-500 ease-out" 
                style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          /* Input Panel with Glassmorphism */
          <div className="bg-[#18181b]/50 border border-[#27272a] rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-6 glow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-200">Submit Code</h2>
                <p className="text-xs text-zinc-500">Select language or load a test template</p>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-300 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="diff">Unified Diff</option>
                  <option value="other">Other</option>
                </select>
                
                <div className="flex gap-1 bg-zinc-950/60 p-1 border border-zinc-800 rounded-lg">
                  <button
                    onClick={() => loadTemplate("python")}
                    className="px-2.5 py-1 rounded text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition"
                  >
                    Py Template
                  </button>
                  <button
                    onClick={() => loadTemplate("diff")}
                    className="px-2.5 py-1 rounded text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition"
                  >
                    Diff Template
                  </button>
                </div>
              </div>
            </div>
            
            <div className="relative rounded-xl border border-zinc-800 bg-zinc-950/60 shadow-inner overflow-hidden font-mono text-sm">
              {/* Window header */}
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-950/90 border-b border-zinc-850">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <span className="text-[11px] text-zinc-500 font-medium">
                  {language === "diff" ? "commit.patch" : `code.${language === "python" ? "py" : language === "javascript" ? "js" : "txt"}`}
                </span>
              </div>
              
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your source code or diff here..."
                className="w-full h-80 bg-transparent text-zinc-200 px-4 py-3 focus:outline-none resize-none font-mono leading-relaxed"
              />
            </div>

            {error && (
              <p className="text-sm text-rose-400 font-medium">{error}</p>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleReviewSubmit}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-750 text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                Run AI Review
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
