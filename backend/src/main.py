from fastapi import FastAPI
from .api.routes import router as api_router

app = FastAPI(
    title="CRM DSC ONE Backend",
    version="0.1.0",
)


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


@app.get("/version")
def version():
    return {"name": "crm-dsc-one-backend", "version": "0.1.0"}


app.include_router(api_router)
