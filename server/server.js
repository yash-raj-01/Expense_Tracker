const express = require('express');
const cors = require('cors');
require('dotenv').config();

const prisma = require('./prismaClient');
const expenseRoutes = require('./routes/expenseRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Flexible CORS setup to support local development and deployed Vercel domains
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5001',
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // If wildcard or all allowed
    if (allowedOrigins.length === 0 || allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    // Allow configured origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow all Vercel preview and production deployments (*.vercel.app)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // Default allow for seamless deployment
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Root endpoint for deployment verification
app.get('/', (req, res) => {
  res.json({
    name: 'Ledger Expense Tracker API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      expenses: '/api/expenses',
      analyticsSummary: '/api/analytics/summary',
      analyticsCategories: '/api/analytics/categories',
      analyticsMonthly: '/api/analytics/monthly',
      analyticsReports: '/api/analytics/reports',
    },
  });
});

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      message: 'Expense Tracker Server is healthy',
      database: 'connected (PostgreSQL)',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

app.use('/api/expenses', expenseRoutes);
app.use('/api/analytics', analyticsRoutes);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
