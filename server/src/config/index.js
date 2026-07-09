import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().default('dev-jwt-secret-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  HUBSPOT_CLIENT_ID: z.string().min(1, 'HUBSPOT_CLIENT_ID is required'),
  HUBSPOT_SECRET: z.string().min(1, 'HUBSPOT_SECRET is required'),
  HUBSPOT_REDIRECT_URL: z.string().min(1, 'HUBSPOT_REDIRECT_URL is required'),
  ENCRYPTION_KEY: z.string().length(64, 'ENCRYPTION_KEY must be a 64-char hex string').optional()
    .or(z.literal('')),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

const config = Object.freeze({
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  isProduction: env.NODE_ENV === 'production',
  isDevelopment: env.NODE_ENV === 'development',

  mongodb: {
    uri: env.MONGODB_URI,
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },

  client: {
    url: env.CLIENT_URL,
  },

  hubspot: {
    clientId: env.HUBSPOT_CLIENT_ID,
    clientSecret: env.HUBSPOT_SECRET,
    redirectUri: env.HUBSPOT_REDIRECT_URL,
    scopes: ['oauth', 'crm.objects.contacts.read', 'crm.objects.contacts.write', 'crm.schemas.contacts.read'],
    authUrl: 'https://app.hubspot.com/oauth/authorize',
    tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
    apiBaseUrl: 'https://api.hubapi.com',
  },

  encryption: {
    key: env.ENCRYPTION_KEY || null,
  },
});

export default config;
