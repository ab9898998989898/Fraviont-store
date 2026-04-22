// Global test setup — mock environment variables required by the application

process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/fraviont_test";
process.env.PAYFAST_MERCHANT_ID = "10000100";
process.env.PAYFAST_MERCHANT_KEY = "46f0cd694581a";
process.env.PAYFAST_PASSPHRASE = "test_passphrase_123";
process.env.PAYFAST_SANDBOX = "true";
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.NEXTAUTH_SECRET = "test-secret-for-vitest";
process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
process.env.OPENROUTER_API_KEY = "sk-or-test-key";
process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
process.env.RESEND_API_KEY = "re_test_key";
process.env.CRON_SECRET = "test-cron-secret";
