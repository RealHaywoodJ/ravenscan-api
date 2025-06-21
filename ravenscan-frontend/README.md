This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# RavenScan Frontend

Next.js frontend for the RavenScan Brand Intelligence API.

## Features

- 🔍 Brand name and username availability checking
- 🌐 Domain availability across multiple TLDs
- 📱 Social media username verification
- 📊 SEO insights and search results
- 🎨 Dark/Light mode toggle
- 📱 Responsive mobile design
- 🔐 User authentication and history tracking
- 📢 Toast notifications and feedback system

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
# Opens on http://localhost:3000
```

## Production Build

```bash
npm run build
npm run start
```

## API Integration

The frontend connects to the RavenScan API. Configure your API key in the UI or set environment variables.

### Required Environment Variables

Add these to Replit Secrets:
- `NEXT_PUBLIC_API_BASE_URL` - API base URL (default: auto-detected)
- `SENTRY_DSN` - Error tracking
- `NEXT_PUBLIC_GA_ID` - Google Analytics

## Testing

```bash
# Run E2E tests
node tests/e2e.js

# Linting
npm run lint
```

## Deployment

This app is configured for Replit deployment. Use the Deploy button in your Repl to publish.

## Tech Stack

- Next.js 15 (App Router)
- React 19
- Tailwind CSS 4
- React Hot Toast
- Replit Database
