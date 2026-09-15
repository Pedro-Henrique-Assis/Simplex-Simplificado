from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routes.problems import router as problems_router
from routes.simplex import router as simplex_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="SimplexLab API",
    description="API educacional para resolução guiada do método Simplex.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(problems_router)
app.include_router(simplex_router)


@app.get("/")
def root():
    return {"name": "SimplexLab API", "status": "ok"}


@app.get("/health")
def health():
    return {"status": "healthy"}
