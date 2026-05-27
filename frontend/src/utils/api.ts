export interface ReviewComment {
  line_number: number;
  severity: "critical" | "warning" | "info";
  message: string;
  suggestion: string;
}

export interface ReviewResponse {
  comments: ReviewComment[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function sendCodeForReview(code: string, language?: string): Promise<ReviewResponse> {
  const response = await fetch(`${API_BASE_URL}/review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code, language }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || "Failed to analyze code. Please try again.");
  }

  return response.json();
}
