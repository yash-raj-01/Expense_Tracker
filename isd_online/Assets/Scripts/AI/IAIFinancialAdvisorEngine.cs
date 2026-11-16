using System;
using System.Collections.Generic;
using UnityEngine;

namespace ISDOnline.Financial
{
    /// <summary>
    /// Financial analysis results produced by the AI Advisor Engine.
    /// </summary>
    [Serializable]
    public class FinancialAnalysisReport
    {
        public float totalSpent;
        public float totalBudgetCeiling;
        public string highestCategory;
        public float highestCategoryAmount;
        public float highestCategoryPercentage;
        public List<string> overBudgetCategories = new List<string>();
        public float projectedEndOfMonthSpending;
        public string budgetHealthStatus; // "EXCELLENT", "MODERATE", "CRITICAL"
        public List<string> recommendations = new List<string>();

        public string GetFormattedTotalSpent() => $"₹{totalSpent:N0}";
        public string GetFormattedProjectedEOM() => $"₹{projectedEndOfMonthSpending:N0}";
    }

    /// <summary>
    /// Extensible interface for financial reasoning engines.
    /// Supports local rule-based heuristics and future cloud LLM integrations.
    /// </summary>
    public interface IAIFinancialAdvisorEngine
    {
        FinancialAnalysisReport Analyze(List<CategoryFinancialData> categories, float defaultCategoryBudget);
    }

    /// <summary>
    /// High-performance local rule-based heuristic financial reasoning engine.
    /// Evaluates category distribution, budget variance, burn rates, and generates actionable saving advice.
    /// </summary>
    public class RuleBasedAdvisorEngine : IAIFinancialAdvisorEngine
    {
        public FinancialAnalysisReport Analyze(List<CategoryFinancialData> categories, float defaultCategoryBudget)
        {
            var report = new FinancialAnalysisReport();

            if (categories == null || categories.Count == 0)
            {
                report.recommendations.Add("No financial data available for analysis.");
                return report;
            }

            float totalSpent = 0f;
            float maxAmount = -1f;
            string topCat = "";
            float totalBudget = 0f;

            foreach (var cat in categories)
            {
                totalSpent += cat.totalSpentRupees;
                totalBudget += cat.budgetLimitRupees > 0f ? cat.budgetLimitRupees : defaultCategoryBudget;

                if (cat.totalSpentRupees > maxAmount)
                {
                    maxAmount = cat.totalSpentRupees;
                    topCat = cat.categoryName;
                }

                if (cat.IsOverBudget || cat.totalSpentRupees > defaultCategoryBudget)
                {
                    float over = cat.totalSpentRupees - (cat.budgetLimitRupees > 0f ? cat.budgetLimitRupees : defaultCategoryBudget);
                    report.overBudgetCategories.Add($"{cat.categoryName} (+₹{over:N0})");
                }
            }

            report.totalSpent = totalSpent;
            report.totalBudgetCeiling = totalBudget;
            report.highestCategory = topCat;
            report.highestCategoryAmount = maxAmount;
            report.highestCategoryPercentage = totalSpent > 0f ? (maxAmount / totalSpent) * 100f : 0f;

            // Burn rate projection (assuming day 15 of 30-day billing cycle)
            int currentDay = 15;
            int totalDays = 30;
            report.projectedEndOfMonthSpending = (totalSpent / currentDay) * totalDays;

            // Budget Health Assessment
            if (report.overBudgetCategories.Count >= 2 || totalSpent > totalBudget)
            {
                report.budgetHealthStatus = "<color=#FF4444>ATTENTION REQUIRED</color>";
            }
            else if (report.overBudgetCategories.Count == 1)
            {
                report.budgetHealthStatus = "<color=#FFB300>MODERATE OVERRUN</color>";
            }
            else
            {
                report.budgetHealthStatus = "<color=#00E676>ON TRACK / HEALTHY</color>";
            }

            // Generate contextual recommendations
            if (topCat.Equals("Food", StringComparison.OrdinalIgnoreCase))
            {
                report.recommendations.Add($"• <b>Food & Dining</b> is your highest outflow (₹{maxAmount:N0}, {report.highestCategoryPercentage:0.1}% of spend). Trimming food delivery by 2x weekly can save ~₹1,500/month.");
            }

            if (report.overBudgetCategories.Count > 0)
            {
                report.recommendations.Add($"• Over-budget categories: <b>{string.Join(", ", report.overBudgetCategories)}</b>. Reallocate surplus from Travel/Shopping to absorb utility spikes.");
            }

            report.recommendations.Add($"• Current burn-rate projects month-end total of <b>₹{report.projectedEndOfMonthSpending:N0}</b>. Maintaining discipline in Entertainment can preserve ₹1,500 in savings.");

            return report;
        }
    }
}
