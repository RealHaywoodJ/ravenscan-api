# main.py

# ─── Standard Library ──────────────────────────────────────────────────────────
import os
import re
import socket
import tempfile
import shutil
import subprocess
import json
from functools import lru_cache
from typing import Optional
from urllib.parse import urlparse

# ─── Third-Party ───────────────────────────────────────────────────────────────
import requests
from bs4 import BeautifulSoup
from fastapi import (
    FastAPI,
    HTTPException,
    Header,
    Depends,
    Request
)
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
from redis.asyncio import Redis

# ─── App Initialization ────────────────────────────────────────────────────────
app = FastAPI(
    title="RavenScan_API",
    description="BrandRaven’s Enhanced Brand Intelligence API",
    version="2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Rate-Limiter Key Functions ────────────────────────────────────────────────
async def key_based(request: Request) -> str:
    """Identify client by API key header (for tiered limits)."""
    return request.headers.get("x-api-key", "")

async def ip_based(request: Request) -> str:
    """Identify client by IP (global cap)."""
    return request.client.host

# ─── Rate-Limiter Bootstrap ────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_limiter():
    """
    Initialize FastAPI-Limiter with an asyncio Redis client.
    Reads REDIS_URL from env (set in Docker Compose), falls back to localhost.
    """
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    redis = Redis.from_url(redis_url, encoding="utf-8", decode_responses=True)
    await FastAPILimiter.init(redis)

# ─── Constants ─────────────────────────────────────────────────────────────────
COMMON_TLDS = [
 ".com", ".net", ".org", ".io", ".co", ".ai", ".app", ".dev", ".xyz", ".tech", ".site", ".online", ".store", ".info", ".me", ".cloud", ".live", ".space", ".blog", ".design", ".network", ".software", ".digital", ".solutions", ".tools", ".studio", ".systems", ".services", ".world", ".agency", ".media", ".company", ".business", ".consulting", ".finance", ".capital", ".ventures", ".today", ".partners", ".global", ".team", ".support", ".web", ".works", ".expert", ".tips", ".technology", ".training", ".video", ".watch", ".bio", ".art", ".health", ".eco", ".love", ".baby", ".shop", ".fans", ".game", ".games", ".link", ".page", ".press", ".news", ".life", ".run", ".name", ".email", ".chat", ".eth", ".crypto", ".nft", ".dao", ".zil", ".x", ".blockchain", ".bit", ".wallet
    # You can trim or extend this list as needed...
]

RDAP_BASE_URL = "https://rdap.org/domain/"

SOCIAL_PLATFORMS = {
    # ─ Legacy & Big-Name ───────────────────────
    "x":         "https://x.com/{name}",                    # formerly Twitter
    "instagram": "https://instagram.com/{name}",
    "facebook":  "https://facebook.com/{name}",
    "linkedin":  "https://linkedin.com/in/{name}",
    "github":    "https://github.com/{name}",

    # ─ Video & Live ────────────────────────────
    "youtube":   "https://youtube.com/{name}",
    "twitch":    "https://twitch.tv/{name}",

    # ─ Short-form & Emerging ──────────────────
    "tiktok":    "https://tiktok.com/@{name}",
    "threads":   "https://threads.net/@{name}",
    "clubhouse": "https://clubhouse.com/@{name}",

    # ─ Messaging & Communities ────────────────
    "telegram":  "https://t.me/{name}",
    "discord":   "https://discord.com/users/{name}",
    "slack":     "https://{name}.slack.com",

    # ─ Fediverse & Niche ──────────────────────
    "mastodon":  "https://mastodon.social/@{name}",
    "lemmy":     "https://lemmy.world/u/{name}",
    "dbzer0":    "https://dbzer0.com/u/{name}",

    # ─ Content & Blogging ─────────────────────
    "medium":    "https://medium.com/@{name}",
    "substack":  "https://{name}.substack.com",

    # ─ Design & Creators ──────────────────────
    "dribbble":  "https://dribbble.com/{name}",
    "behance":   "https://behance.net/{name}",
}

# ─── Helper Functions ──────────────────────────────────────────────────────────
def check_domain_availability(domain: str) -> str:
    try:
        socket.gethostbyname(domain)
        return "taken"
    except socket.gaierror:
        return "available"

def get_whois_data(domain: str) -> dict:
    try:
        resp = requests.get(f"{RDAP_BASE_URL}{domain}", timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            return {
                "expiration": data.get("events", [{}])[0].get("eventDate"),
                "registrar":  data.get("registrar", {}).get("name", "Unknown")
            }
        return {"error": "No RDAP data"}
    except Exception as e:
        return {"error": str(e)}

def check_seo(name: str) -> dict:
    q = requests.utils.quote(f'"{name}"')
    resp = requests.get(
        f"https://www.bing.com/search?q={q}",
        headers={"User-Agent": "Mozilla/5.0"},
        timeout=5
    )
    soup = BeautifulSoup(resp.text, "lxml")

    span = soup.find("span", class_="sb_count")
    hits = int(re.sub(r"[^\d]", "", span.get_text())) if span else 0

    results = [
        li.a["href"]
        for li in soup.select("li.b_algo")[:5]
        if li.a and li.a["href"]
    ]
    return {"hits": hits, "top_results": results}

def generate_suggestions(name: str) -> list:
    return [
        f"{name}hq", f"get{name}", f"try{name}", f"use{name}",
        f"{name}app", f"{name}official", f"{name}online",
        f"join{name}", f"{name}now", f"{name}net"
    ]

def check_social_handles(name: str) -> dict:
    key = name.lower()
    exe = shutil.which("sherlock")

    # 1) Sherlock CLI (if installed)
    if exe:
        fd, tmp = tempfile.mkstemp(prefix=f"{key}_", suffix=".json")
        os.close(fd)
        try:
            proc = subprocess.run(
                [exe, "--print-all", "--json", tmp, key],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=60
            )
            if proc.returncode == 0 and os.path.exists(tmp):
                with open(tmp, "r", encoding="utf-8") as f:
                    data = json.load(f)
                if data:
                    return data
        except Exception:
            pass
        finally:
            try: os.remove(tmp)
            except: pass

    # 2) HTTP HEAD fallback
    out = {}
    for platform, tpl in SOCIAL_PLATFORMS.items():
        url = tpl.format(name=key)
        try:
            r = requests.head(url, allow_redirects=True, timeout=5)
            out[platform] = "taken" if r.status_code == 200 else "available"
        except Exception:
            out[platform] = "error"
    return out

# ─── Caching Wrappers ─────────────────────────────────────────────────────────
@lru_cache(maxsize=256)
def whois_cached(domain: str) -> dict:
    return get_whois_data(domain)

@lru_cache(maxsize=128)
def seo_cached(name: str) -> dict:
    return check_seo(name)

@lru_cache(maxsize=128)
def socials_cached(name: str) -> dict:
    return check_social_handles(name)

# ─── Endpoints ────────────────────────────────────────────────────────────────
@app.get(
    "/",
    dependencies=[Depends(RateLimiter(times=100, seconds=60, identifier=ip_based))]
)
async def root() -> dict:
    return {"status": "RavenScan_API is up", "version": "2.0"}

@app.get(
    "/check",
    dependencies=[
        # Free tier: 10 calls/day per API key
        Depends(RateLimiter(times=10, seconds=86400,  identifier=key_based)),
        # Heimdall tier: 1000 calls/minute per API key
        Depends(RateLimiter(times=1000, seconds=60, identifier=key_based)),
        # Global cap: 120 calls/minute per IP
        Depends(RateLimiter(times=120, seconds=60,  identifier=ip_based)),
    ]
)
async def check_name(
    request: Request,
    name: str,
    tlds: str = "com,net,org,io",
    include_seo: bool = True,
    include_socials: bool = True,
    include_suggestions: bool = True,
    x_api_key: Optional[str] = Header(None, alias="x-api-key")
) -> JSONResponse:
    if x_api_key != "RavenScan_API_KEY":
        raise HTTPException(status_code=401, detail="Invalid API key")

    # Domains & WHOIS
    domains  = {}
    whois     = {}
    for tld in tlds.split(","):
        d = f"{name.lower()}.{tld.strip()}"
        status = check_domain_availability(d)
        domains[d] = status
        if status == "taken":
            whois[d] = whois_cached(d)

    # Optional blocks
    seo         = seo_cached(name)                if include_seo         else {}
    socials     = socials_cached(name)            if include_socials     else {}
    suggestions = generate_suggestions(name)      if include_suggestions else []

    return JSONResponse({
        "brand_name":  name,
        "domains":     domains,
        "whois":       whois,
        "seo":         seo,
        "socials":     socials,
        "suggestions": suggestions
    })
