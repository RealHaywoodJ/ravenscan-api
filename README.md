
# RavenScan - Brand Intelligence API & Frontend

RavenScan is a comprehensive brand intelligence platform that checks domain availability, social media usernames, and provides SEO insights for brand names across multiple platforms.

## Project Structure

- `main.py` - FastAPI backend API
- `ravenscan-frontend/` - Next.js frontend application
- `sherlock/` - Username checking utility

## Quick Start

### Running the Backend API

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start the API server
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### Running the Frontend

```bash
cd ravenscan-frontend
npm install
npm run dev
```

## API Usage

### Authentication
All API requests require an API key header:
```
X-API-Key: RavenScan_API_KEY
```

### Check Brand Name
```bash
curl -H "X-API-Key: RavenScan_API_KEY" \
  "https://your-api-url.replit.app/check?name=brandname&tlds=com,net,org"
```

### Response Format
```json
{
  "brand_name": "brandname",
  "domains": {
    "brandname.com": "taken",
    "brandname.net": "available"
  },
  "socials": {
    "twitter": "available",
    "instagram": "taken"
  },
  "seo": {
    "hits": 1250,
    "top_results": ["..."]
  },
  "suggestions": ["branднameapp", "getbrandname"]
}
```

## Deployment on Replit

1. Fork this Repl
2. Add your API key to Replit Secrets as `RAVENSCAN_API_KEY`
3. Click the Run button to start the frontend
4. Use the "Deploy" button to publish your app

## Testing

```bash
# Run E2E tests
cd ravenscan-frontend
node tests/e2e.js
```

## Environment Variables

Set these in Replit Secrets:
- `RAVENSCAN_API_KEY` - Your API key
- `SENTRY_DSN` - Error tracking (optional)
- `NEXT_PUBLIC_GA_ID` - Google Analytics ID (optional)

## License

MIT License - see LICENSE file for details.
