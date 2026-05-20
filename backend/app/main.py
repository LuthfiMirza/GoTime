import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.predict import router as predict_router
from app.routers.weather import router as weather_router
from app.services.ml_service import load_model, set_model

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        model = load_model()
    except RuntimeError:
        model = None
    app.state.model = model
    set_model(model)
    yield
    app.state.model = None
    set_model(None)


app = FastAPI(
    title="GoTime API",
    description="Prediksi jam berangkat berbasis Machine Learning",
    version="1.0.0",
    lifespan=lifespan,
)

frontend_url = os.getenv("FRONTEND_URL", "")
allow_origins = [
    "http://localhost:3000",
    "https://*.vercel.app",
]
if frontend_url:
    allow_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model_loaded": hasattr(app.state, "model") and app.state.model is not None,
    }


app.include_router(predict_router)
app.include_router(weather_router)
