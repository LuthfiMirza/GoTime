from fastapi import APIRouter, HTTPException, status

from app.schemas.predict import PredictRequest, PredictResponse
from app.services import ml_service

router = APIRouter(prefix="/predict", tags=["predict"])


@router.post("/", response_model=PredictResponse)
async def predict_departure(request: PredictRequest):
    if ml_service.get_model() is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model belum siap",
        )
    try:
        return ml_service.predict(request)
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediksi gagal: {exc}",
        ) from exc
