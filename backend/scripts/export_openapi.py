import json
from pathlib import Path
import sys

from fastapi.openapi.utils import get_openapi

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from main import app


if __name__ == "__main__":
    spec = get_openapi(
        title=app.title,
        version=app.version,
        description="Backend API contract for frontend mock replacement.",
        routes=app.routes,
    )

    output_path = Path("openapi.json")
    output_path.write_text(json.dumps(spec, indent=2), encoding="utf-8")
    print(f"OpenAPI written to {output_path.resolve()}")
