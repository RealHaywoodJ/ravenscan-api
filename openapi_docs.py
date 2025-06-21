
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from fastapi.responses import HTMLResponse

def custom_openapi():
    """Generate custom OpenAPI schema."""
    openapi_schema = get_openapi(
        title="RavenScan API",
        version="2.0",
        description="""
        ## Brand Intelligence & Social Media Username Checker

        RavenScan provides comprehensive brand intelligence by checking:
        - Domain availability across multiple TLDs
        - Social media username availability
        - SEO insights and search results
        - Brand name suggestions

        ### Authentication
        All endpoints require a Bearer token in the Authorization header:
        ```
        Authorization: Bearer YOUR_API_KEY
        ```

        ### Rate Limits
        - 100 requests per hour per API key
        - 120 requests per minute per IP address
        """,
        routes=app.routes,
    )
    
    openapi_schema["info"]["x-logo"] = {
        "url": "https://via.placeholder.com/120x120/000000/FFFFFF?text=RS"
    }
    
    # Add security scheme
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    
    # Apply security to all paths
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method["security"] = [{"BearerAuth": []}]
    
    return openapi_schema

# Add to main.py
def setup_docs(app: FastAPI):
    """Setup custom OpenAPI docs."""
    app.openapi = custom_openapi
    
    @app.get("/docs", response_class=HTMLResponse, include_in_schema=False)
    async def swagger_ui():
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>RavenScan API Documentation</title>
            <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui.css" />
        </head>
        <body>
            <div id="swagger-ui"></div>
            <script src="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui-bundle.js"></script>
            <script>
                SwaggerUIBundle({{
                    url: '/openapi.json',
                    dom_id: '#swagger-ui',
                    presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.presets.standalone]
                }})
            </script>
        </body>
        </html>
        """
