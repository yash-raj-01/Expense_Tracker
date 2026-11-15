const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL;

const isLocalhost = Boolean(
  connectionString && (connectionString.includes('localhost') || connectionString.includes('127.0.0.1'))
);

const poolConfig = {
  connectionString,
};

// Enable SSL for remote cloud databases (Neon, Supabase, Render, AWS RDS, etc.)
// or whenever sslmode=require is specified.
if (
  connectionString &&
  (!isLocalhost || connectionString.includes('sslmode=require')) &&
  !connectionString.includes('sslmode=disable')
) {
  poolConfig.ssl = {
    rejectUnauthorized: false,
  };
}

// In serverless environments, limit pool connections per container to avoid exhausting DB limits
if (process.env.NODE_ENV === 'production') {
  poolConfig.max = process.env.PG_MAX_POOL ? parseInt(process.env.PG_MAX_POOL, 10) : 5;
  poolConfig.idleTimeoutMillis = 30000;
  poolConfig.connectionTimeoutMillis = 10000;
}

// Use globalThis singleton to prevent exhausting connections across hot-reloads and lambdas
const globalForPrisma = globalThis;

const pool = globalForPrisma.ledgerPgPool || new Pool(poolConfig);
const adapter = globalForPrisma.ledgerPrismaAdapter || new PrismaPg(pool);
const prisma = globalForPrisma.ledgerPrisma || new PrismaClient({ adapter });

globalForPrisma.ledgerPgPool = pool;
globalForPrisma.ledgerPrismaAdapter = adapter;
globalForPrisma.ledgerPrisma = prisma;

module.exports = prisma;
module.exports.pool = pool;
