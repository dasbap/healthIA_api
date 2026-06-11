from fastapi import Request
from fastapi.responses import JSONResponse


class ServiceUnavailableError(RuntimeError):
    pass


async def service_unavailable_handler(
    request: Request,
    exc: ServiceUnavailableError,
) -> JSONResponse:
    return JSONResponse(
        status_code=503,
        content={
            "error": "service_unavailable",
            "message": str(exc),
            "path": request.url.path,
        },
    )
