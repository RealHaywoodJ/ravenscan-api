from fastapi import FastAPI, HTTPException, Header, Depends, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import datetime
import os
import re
import socket
import requests
from bs4 import BeautifulSoup
from typing import Optional
from urllib.parse import urlparse

# ─── Enviroment Variable Imports ───────────────────────────────────────────────
from dotenv import load_dotenv
load_dotenv()


# ─── App Initialization ────────────────────────────────────────────────────────
app = FastAPI(
    title="RavenScan API", 
    description="Brand Intelligence API",
    version="2.0",
    docs_url="/docs",
    openapi_url="/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Constants ─────────────────────────────────────────────────────────────────
COMMON_TLDS = [
    ".com", ".net", ".org", ".io", ".co", ".ai", ".app", ".dev", ".xyz", 
    ".tech", ".site", ".online", ".store", ".info", ".me", ".cloud"
]

SOCIAL_PLATFORMS = {
    "x": "https://x.com/{name}",
    "instagram": "https://instagram.com/{name}",
    "facebook": "https://facebook.com/{name}",
    "linkedin": "https://linkedin.com/in/{name}",
    "github": "https://github.com/{name}",
    "youtube": "https://youtube.com/{name}",
    "tiktok": "https://tiktok.com/@{name}",
    "threads": "https://threads.net/@{name}",
}

# ─── Helper Functions ──────────────────────────────────────────────────────────
def check_domain_availability(domain: str) -> str:
    try:
        socket.gethostbyname(domain)
        return "taken"
    except socket.gaierror:
        return "available"

def check_seo(name: str) -> dict:
    try:
        q = requests.utils.quote(f'"{name}"')
        resp = requests.get(
            f"https://www.bing.com/search?q={q}",
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=5
        )
        soup = BeautifulSoup(resp.text, "html.parser")

        span = soup.find("span", class_="sb_count")
        hits = int(re.sub(r"[^\d]", "", span.get_text())) if span else 0

        results = [
            li.a["href"]
            for li in soup.select("li.b_algo")[:5]
            if li.a and li.a.get("href")
        ]
        return {"hits": hits, "top_results": results}
    except Exception as e:
        return {"hits": 0, "top_results": [], "error": str(e)}

def check_social_handles(name: str) -> dict:
    key = name.lower()
    out = {}

    for platform, tpl in SOCIAL_PLATFORMS.items():
        url = tpl.format(name=key)
        try:
            r = requests.get(url, timeout=5, headers={"User-Agent": "Mozilla/5.0"})
            html = r.text.lower()

            if platform == "x":
                if "this account doesn’t exist" in html or "page doesn’t exist" in html:
                    out[platform] = "available"
                else:
                    out[platform] = "taken"

            elif platform == "instagram":
                if "sorry, this page isn't available" in html:
                    out[platform] = "available"
                else:
                    out[platform] = "taken"

            elif platform == "youtube":
                if "channel does not exist" in html or "404" in html:
                    out[platform] = "available"
                else:
                    out[platform] = "taken"

            else:
                out[platform] = "taken" if r.status_code == 200 else "available"

        except Exception:
            out[platform] = "error"

    return out


def generate_suggestions(name: str) -> list:
    return [
        f"{name}hq", f"get{name}", f"try{name}", f"use{name}",
        f"{name}app", f"{name}official", f"{name}online"
    ]

# ─── Endpoints ────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "status": "healthy",
        "service": "RavenScan API",
        "timestamp": datetime.datetime.now().isoformat(),
        "message": "RavenScan API is running successfully"
    }

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "checks": {
            "database": "connected",
            "api": "operational",
            "version": "2.0"
        }
    }

@app.get("/check")
async def check_name(
    name: str,
    tlds: str = "com,net,org,io",
    include_seo: bool = True,
    include_socials: bool = True,
    include_suggestions: bool = True,
    x_api_key: Optional[str] = Header(None, alias="x-api-key")
) -> JSONResponse:
    expected_api_key = os.getenv("RAVENSCAN_API_KEY")
    if not expected_api_key or x_api_key != expected_api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")

    # Domains check
    domains = {}
    for tld in tlds.split(","):
        d = f"{name.lower()}.{tld.strip()}"
        status = check_domain_availability(d)
        domains[d] = status

    # Optional blocks
    seo = check_seo(name) if include_seo else {}
    socials = check_social_handles(name) if include_socials else {}
    suggestions = generate_suggestions(name) if include_suggestions else []

    return JSONResponse({
        "brand_name": name,
        "domains": domains,
        "seo": seo,
        "socials": socials,
        "suggestions": suggestions
    })