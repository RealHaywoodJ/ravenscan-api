
# RavenScan - Brand Intelligence API & Frontend

RavenScan is a comprehensive brand intelligence platform that checks domain availability, social media usernames, and provides SEO insights for brand names across multiple platforms.

## 🚀 Quick Start

### 1. Get Your API Key
Set your API key as `RavenScan_API_KEY` in Replit Secrets.

### 2. Make Your First Request
```bash
curl -H "Authorization: Bearer RavenScan_API_KEY" \
  "https://your-repl-url.replit.app/v1/check?name=mybrand&tlds=com,net,org"
```

### 3. Response Example
```json
{
  "brand_name": "mybrand",
  "domains": {
    "mybrand.com": "taken",
    "mybrand.net": "available",
    "mybrand.org": "available"
  },
  "socials": {
    "twitter": "available",
    "instagram": "taken",
    "github": "available"
  },
  "seo": {
    "hits": 1250,
    "top_results": ["https://example.com/mybrand"]
  },
  "suggestions": ["mybrandapp", "getmybrand", "trymybrand"]
}
```

## 📖 API Documentation

Visit `/docs` for interactive Swagger UI documentation.

## 🔑 Authentication

All API requests require a Bearer token:
```bash
Authorization: Bearer YOUR_API_KEY
```

## 📊 Rate Limits

- **100 requests/hour** per API key
- **120 requests/minute** per IP address

## 🛠 Installation & Setup

### Backend API
```bash
# Install dependencies
pip install -r requirements.txt

# Start API server
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd ravenscan-frontend
npm install
npm run dev  # Development
npm run build && npm run start  # Production
```

## 🔗 API Endpoints

### Health Check
```bash
GET /health
```

### Brand Check (v1)
```bash
GET /v1/check?name=BRAND&tlds=com,net&include_seo=true
```

**Parameters:**
- `name` (required): Brand name to check
- `tlds` (optional): Comma-separated TLDs (default: com,net,org,io)
- `include_seo` (optional): Include SEO analysis (default: true)
- `include_socials` (optional): Include social media check (default: true)
- `include_suggestions` (optional): Include name suggestions (default: true)

## 📱 Frontend Features

- 🔍 Real-time brand name checking
- 🌐 Domain availability across 50+ TLDs
- 📱 Social media username verification
- 📊 SEO insights and search results
- 🎨 Dark/Light mode toggle
- 📱 Mobile-responsive design
- 🔐 User authentication & history
- 📢 Toast notifications & feedback

## 🚀 Deployment on Replit

1. Fork this Repl
2. Add `RavenScan_API_KEY` to Replit Secrets
3. Click **Run** to start development
4. Click **Deploy** to publish your app

## 🔧 Environment Variables

Add these to Replit Secrets:
- `RavenScan_API_KEY` - Your API authentication key
- `REDIS_URL` - Redis connection for rate limiting
- `ERROR_WEBHOOK_URL` - Webhook for error alerts
- `SENTRY_DSN` - Error tracking (frontend)
- `NEXT_PUBLIC_GA_ID` - Google Analytics

## 📊 Monitoring

- **Health Check**: `/health` and `/api/health`
- **OpenAPI Docs**: `/docs` and `/openapi.json`
- **Error Logging**: Console logs + webhook alerts
- **Uptime Monitoring**: Use UptimeRobot to ping `/health`

## 🧪 Testing

```bash
# API tests
python -m pytest

# Frontend E2E tests
cd ravenscan-frontend && node tests/e2e.js

# Linting
npm run lint
```

## 📋 Code Examples

### Python
```python
import requests

headers = {"Authorization": "Bearer RavenScan_API_KEY"}
response = requests.get(
    "https://your-api.replit.app/v1/check?name=mybrand",
    headers=headers
)
data = response.json()
print(f"Brand: {data['brand_name']}")
```

### JavaScript
```javascript
const response = await fetch('/v1/check?name=mybrand', {
  headers: {
    'Authorization': 'Bearer RavenScan_API_KEY'
  }
});
const data = await response.json();
console.log('Domains:', data.domains);
```

### cURL Examples
```bash
# Basic check
curl -H "Authorization: Bearer RavenScan_API_KEY" \
  "https://your-api.replit.app/v1/check?name=testbrand"

# Custom TLDs only
curl -H "Authorization: Bearer RavenScan_API_KEY" \
  "https://your-api.replit.app/v1/check?name=techstart&tlds=io,ai,tech"

# Skip social media check
curl -H "Authorization: Bearer RavenScan_API_KEY" \
  "https://your-api.replit.app/v1/check?name=fastcheck&include_socials=false"
```

## 🎯 Roadmap

- [ ] v2 API with enhanced features
- [ ] Bulk checking endpoints
- [ ] Webhook notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

## 📄 License

MIT License - see LICENSE file for details.
