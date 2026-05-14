from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Literal

class ReviewRequest(BaseModel):
    code: str = Field(..., description="The source code or unified diff to be reviewed")
    language: Optional[str] = Field(None, description="Programming language of the code (optional)")

    @field_validator("code")
    @classmethod
    def validate_code_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Submitted code content cannot be empty or only whitespace")
        return v

class ReviewComment(BaseModel):
    line_number: int = Field(..., description="The 1-based line number in the submitted code/diff where this issue exists")
    severity: Literal["critical", "warning", "info"] = Field(..., description="The level of importance of the review comment")
    message: str = Field(..., description="The explanation of the bug, issue, or improvement area")
    suggestion: str = Field(..., description="Code suggestion or recommended fix")

class ReviewResponse(BaseModel):
    comments: List[ReviewComment] = Field(default_factory=list, description="List of generated review comments")
