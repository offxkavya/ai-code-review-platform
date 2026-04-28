import json
from openai import OpenAI
from app.core.config import settings
from app.schemas.review import ReviewResponse, ReviewComment

def get_openai_client() -> OpenAI:
    if not settings.OPENAI_API_KEY:
        return None
    return OpenAI(api_key=settings.OPENAI_API_KEY)

def generate_mock_comments(code: str) -> list:
    """Generate intelligent mock comments if OpenAI API key is not configured."""
    comments = []
    lines = code.split("\n")
    for i, line in enumerate(lines, 1):
        clean_line = line.strip()
        # Mock vulnerability or issues based on keywords
        if "eval(" in clean_line:
            comments.append({
                "line_number": i,
                "severity": "critical",
                "message": "Use of eval() detected. This is a severe security risk and allows arbitrary code execution.",
                "suggestion": "Replace eval() with safe alternatives like json.loads() or ast.literal_eval() if parsing data."
            })
        elif "print(" in clean_line:
            comments.append({
                "line_number": i,
                "severity": "info",
                "message": "Production code should use logging instead of print statements.",
                "suggestion": "Import and use the 'logging' module to trace behavior: logging.info(...)"
            })
        elif "TODO" in clean_line:
            comments.append({
                "line_number": i,
                "severity": "warning",
                "message": "Unresolved TODO task found.",
                "suggestion": "Implement the missing feature or document the ticket reference."
            })
        elif "except:" in clean_line:
            comments.append({
                "line_number": i,
                "severity": "warning",
                "message": "Bare exception handler detected. Catching general exceptions can hide bugs.",
                "suggestion": "Catch specific exceptions (e.g., ValueError, KeyError) instead of a bare except clause."
            })
            
    # Default mock if no matching patterns
    if not comments:
        comments.append({
            "line_number": 1,
            "severity": "info",
            "message": "Code structure looks clean overall. Consider adding comprehensive docstrings.",
            "suggestion": "Add module-level or function-level docstrings describing inputs and outputs."
        })
    return comments

def review_code(code: str, language: str = None) -> ReviewResponse:
    client = get_openai_client()
    if not client:
        # Fallback to mock reviews
        mock_comments = generate_mock_comments(code)
        return ReviewResponse(comments=[ReviewComment(**c) for c in mock_comments])

    system_prompt = (
        "You are a senior engineer reviewing a code submission. "
        "Identify bugs, security vulnerabilities, performance bottlenecks, and code style improvements.\n"
        "Return a JSON object containing a 'comments' key, which is an array of objects. "
        "Each object must have the following format exactly:\n"
        "{\n"
        "  \"line_number\": <int, 1-based line number of the code where the issue is found>,\n"
        "  \"severity\": \"critical\" | \"warning\" | \"info\",\n"
        "  \"message\": \"<explanation of the issue>\",\n"
        "  \"suggestion\": \"<recommended fix or improvement code>\"\n"
        "}"
    )

    user_prompt = f"Please review the following code:\n\n```\n{code}\n```"
    if language:
        user_prompt = f"Language: {language}\n\n" + user_prompt

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2
        )
        result_json = json.loads(response.choices[0].message.content)
        comments_list = result_json.get("comments", [])
        return ReviewResponse(comments=[ReviewComment(**c) for c in comments_list])
    except Exception as e:
        # Fallback if OpenAI call fails
        print(f"Error during OpenAI review API call: {e}")
        mock_comments = generate_mock_comments(code)
        return ReviewResponse(comments=[ReviewComment(**c) for c in mock_comments])
