from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_db_and_tables
from app.modules.auth.router import router as auth_router
from app.modules.usuarios.router import router as usuarios_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(
    title="Food Store API",
    description="Sistema integral de gestion de pedidos de comida",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(usuarios_router, prefix="/api/v1")


@app.get("/", tags=["Sistema"])
def root():
    return {
        "message": "Food Store API",
        "version": "1.0.0",
        "status": "ok",
    }

from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.exceptions import (
    NotFoundError,
    ConflictError,
    BusinessRuleError,
)
from app.modules.categorias.router import router as categorias_router


@app.exception_handler(NotFoundError)
async def not_found_handler(request: Request, exc: NotFoundError):
    return JSONResponse(
        status_code=404,
        content={"detail": str(exc)},
    )


@app.exception_handler(ConflictError)
async def conflict_handler(request: Request, exc: ConflictError):
    return JSONResponse(
        status_code=409,
        content={"detail": str(exc)},
    )


@app.exception_handler(BusinessRuleError)
async def business_handler(request: Request, exc: BusinessRuleError):
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)},
    )


app.include_router(categorias_router, prefix="/api/v1")

from app.modules.productos.router import router as productos_router

app.include_router(productos_router, prefix="/api/v1")

from app.modules.pedidos.router import router as pedidos_router

app.include_router(pedidos_router, prefix="/api/v1")
