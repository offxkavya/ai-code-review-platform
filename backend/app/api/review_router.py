from fastapi import APIRouter, HTTPException
from app.schemas.review import ReviewRequest, ReviewResponse
from app.services.openai_service import review_code

router = APIRouter(prefix="/review", tags=["review"])

@router.post("", response_model=ReviewResponse)
def review_code_endpoint(payload: ReviewRequest):
    try:
        return review_code(payload.code, payload.language)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze code: {str(e)}")
