from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.review_router import router as review_router
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

# Enable CORS for local Next.js client development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(review_router, prefix="/api")

@app.get("/")
def root():
    return {"message": f"{settings.PROJECT_NAME} Backend Running"}