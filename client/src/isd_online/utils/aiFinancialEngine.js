/**
 * @file aiFinancialEngine.js
 * @description AI Financial Heuristic & Predictive Analytics Engine.
 * Implements deterministic machine learning and statistical heuristics for:
 * 1. Anomaly detection (spending spikes beyond statistical thresholds).
 * 2. Linear burn-rate forecasting for end-of-month projection.
 * 3. Budget breach risk assessment.
 * 4. Automated natural-language synthesis for 3D AI Financial Advisor Orb.
 */

/**
 * Format raw currency values into standard Indian Rupee notation (₹ xx,xxx)
 * @param {number} value
 * @returns {string}
 */
export function formatINR(value) {
  if (value === undefined || value === null || isNaN(value)) return '₹0';
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

/**
 * Perform comprehensive AI predictive analysis on category spending and transactions.
 * @param {Array} categories List of categories with amounts and budgets
 * @param {Array} transactions List of transactions
 * @param {number} budgetCeiling Custom user threshold/budget plane height
 * @returns {Object} Comprehensive predictive report and voice script
 */
export function analyzeFinancialHealth(categories = [], transactions = [], budgetCeiling = 18000) {
  if (!categories || categories.length === 0) {
    return {
      totalSpend: 0,
      highestCategory: null,
      burnRateForecast: 0,
      anomalies: [],
      budgetRisks: [],
      healthScore: 100,
      speechScript: 'Welcome to your 3D VR financial room. No expenses have been logged yet. Your budget is completely clear.',
      recommendations: ['Add your daily expenses to initialize AI predictive analytics.'],
    };
  }

  // 1. Total Spend and Highest Spending Category
  const totalSpend = categories.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const sortedCategories = [...categories].sort((a, b) => (b.amount || 0) - (a.amount || 0));
  const highestCategory = sortedCategories[0] || null;
  const highestSpendPercent = totalSpend > 0 ? ((highestCategory.amount / totalSpend) * 100).toFixed(1) : 0;

  // 2. Budget Risk Detection (Comparing against both category budget and interactive 3D budget ceiling)
  const budgetRisks = categories.filter((c) => {
    const threshold = c.budget || budgetCeiling;
    return c.amount > threshold;
  }).map((c) => {
    const threshold = c.budget || budgetCeiling;
    const overage = c.amount - threshold;
    const percentOver = ((overage / threshold) * 100).toFixed(1);
    return {
      category: c.name || c.category,
      amount: c.amount,
      threshold,
      overage,
      percentOver,
      severity: overage > 5000 ? 'critical' : 'warning',
    };
  });

  // 3. Statistical Anomaly Detection in Transactions (Z-score heuristic)
  const anomalies = [];
  if (transactions && transactions.length >= 3) {
    const amounts = transactions.map((t) => Number(t.amount) || 0);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance) || 1;

    transactions.forEach((tx) => {
      const zScore = (tx.amount - mean) / stdDev;
      if (zScore > 1.8) {
        anomalies.push({
          title: tx.title || tx.description || 'Transaction',
          category: tx.category,
          amount: tx.amount,
          date: tx.date,
          zScore: zScore.toFixed(2),
          factor: (tx.amount / mean).toFixed(1),
        });
      }
    });
  }

  // 4. Burn-rate and End-of-Month Forecast
  // Determine day of month (or simulate day 15 if not current month)
  const now = new Date();
  const dayOfMonth = Math.max(1, Math.min(now.getDate(), 30));
  const daysInMonth = 30;
  const dailyRunRate = totalSpend / dayOfMonth;
  const projectedMonthEndSpend = Math.round(dailyRunRate * daysInMonth);
  const estimatedSavingsPotential = Math.round(budgetRisks.reduce((acc, r) => acc + r.overage, 0) * 0.7);

  // 5. Financial Health Score (0 - 100)
  let healthScore = 100;
  healthScore -= budgetRisks.length * 12;
  healthScore -= anomalies.length * 8;
  if (highestCategory && Number(highestSpendPercent) > 35) {
    healthScore -= 10;
  }
  healthScore = Math.max(25, Math.min(100, Math.round(healthScore)));

  // 6. Actionable AI Recommendations
  const recommendations = [];
  if (highestCategory) {
    recommendations.push(
      `Your largest outlay is ${highestCategory.name || highestCategory.category} at ${formatINR(highestCategory.amount)} (${highestSpendPercent}% of total). Consider implementing a 15% allocation cap.`
    );
  }
  if (budgetRisks.length > 0) {
    const topRisk = budgetRisks[0];
    recommendations.push(
      `${topRisk.category} has breached the 3D budget plane by ${formatINR(topRisk.overage)} (+${topRisk.percentOver}%). Pause non-essential expenditures in this segment.`
    );
  }
  if (anomalies.length > 0) {
    recommendations.push(
      `AI detected ${anomalies.length} statistical spending ${anomalies.length === 1 ? 'anomaly' : 'anomalies'}, led by "${anomalies[0].title}" (${formatINR(anomalies[0].amount)}).`
    );
  }
  if (estimatedSavingsPotential > 0) {
    recommendations.push(
      `Opportunity: Trimming over-budget sectors could yield an estimated ${formatINR(estimatedSavingsPotential)} into your high-yield investment pillars.`
    );
  }

  // 7. Natural Language Voice Synthesis Script for the 3D AI Orb
  const riskSummary =
    budgetRisks.length === 0
      ? 'All your spending categories remain safely underneath the budget plane.'
      : `Caution: ${budgetRisks.length} ${budgetRisks.length === 1 ? 'category has' : 'categories have'} pierced above your budget plane, led by ${budgetRisks[0].category}.`;

  const speechScript = `Hello! I am your AI Financial Advisor inside Ledger 3D. Your total logged spending stands at ${formatINR(totalSpend)}. Your primary outflow is ${highestCategory ? highestCategory.name || highestCategory.category : 'General Expenses'}, accounting for ${highestSpendPercent} percent of your portfolio. At your current daily burn rate, projected month-end expenditure is ${formatINR(projectedMonthEndSpend)}. ${riskSummary} Your overall financial stability index is rated at ${healthScore} out of 100. Feel free to gaze at any pillar for itemized transactions!`;

  return {
    totalSpend,
    highestCategory,
    highestSpendPercent,
    burnRateForecast: projectedMonthEndSpend,
    dailyRunRate: Math.round(dailyRunRate),
    anomalies,
    budgetRisks,
    healthScore,
    recommendations,
    speechScript,
  };
}
