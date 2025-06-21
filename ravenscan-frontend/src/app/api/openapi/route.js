
import { NextResponse } from 'next/server';

export async function GET() {
  const openApiSpec = {
    openapi: "3.0.0",
    info: {
      title: "RavenScan API",
      version: "2.0",
      description: "Brand Intelligence & Social Media Username Checker"
    },
    servers: [
      {
        url: "https://ravenscan-api.etmunson91.replit.app",
        description: "Production API"
      }
    ],
    security: [
      {
        ApiKeyAuth: []
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key"
        }
      }
    },
    paths: {
      "/": {
        get: {
          summary: "Health check",
          responses: {
            "200": {
              description: "API status",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string" },
                      version: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/check": {
        get: {
          summary: "Check brand name availability",
          parameters: [
            {
              name: "name",
              in: "query",
              required: true,
              schema: { type: "string" },
              description: "Brand name to check"
            },
            {
              name: "tlds",
              in: "query",
              schema: { type: "string", default: "com,net,org,io" },
              description: "Comma-separated list of TLDs"
            },
            {
              name: "include_seo",
              in: "query",
              schema: { type: "boolean", default: true },
              description: "Include SEO analysis"
            },
            {
              name: "include_socials",
              in: "query",
              schema: { type: "boolean", default: true },
              description: "Include social media check"
            },
            {
              name: "include_suggestions",
              in: "query",
              schema: { type: "boolean", default: true },
              description: "Include name suggestions"
            }
          ],
          responses: {
            "200": {
              description: "Brand check results",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      brand_name: { type: "string" },
                      domains: { type: "object" },
                      whois: { type: "object" },
                      seo: { type: "object" },
                      socials: { type: "object" },
                      suggestions: { type: "array", items: { type: "string" } }
                    }
                  }
                }
              }
            },
            "401": {
              description: "Invalid API key"
            }
          }
        }
      }
    }
  };

  return NextResponse.json(openApiSpec);
}
