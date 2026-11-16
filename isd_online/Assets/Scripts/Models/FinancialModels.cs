using System;
using System.Collections.Generic;
using UnityEngine;

namespace ISDOnline.Financial
{
    /// <summary>
    /// Represents a single expense record matching the Prisma PostgreSQL schema:
    /// id (Int), title (String), amount (Int in paise), type (String), category (String), date (DateTime)
    /// </summary>
    [Serializable]
    public class ExpenseItem
    {
        public int id;
        public string title;
        public long amount; // Integer paise from database (100 paise = 1 INR)
        public string type = "EXPENSE"; // "EXPENSE" or "INCOME"
        public string category;
        public string date;
        public string createdAt;
        public string updatedAt;

        /// <summary>
        /// Converts the database paise integer into Indian Rupees (INR).
        /// </summary>
        public float AmountInRupees => amount / 100f;
    }

    [Serializable]
    public class ExpenseListResponse
    {
        public bool success;
        public int count;
        public List<ExpenseItem> data;
    }

    /// <summary>
    /// Matches GET /api/analytics/categories response items.
    /// </summary>
    [Serializable]
    public class CategoryAnalyticsItem
    {
        public string category;
        public long amount; // in paise
        public float amountRupees; // in rupees
        public int count;
        public float percentage;
    }

    [Serializable]
    public class CategoryAnalyticsResponse
    {
        public bool success;
        public long totalExpenses;
        public float totalExpensesRupees;
        public int count;
        public List<CategoryAnalyticsItem> data;
    }

    [Serializable]
    public class HighestCategoryData
    {
        public string category;
        public long amount;
        public float amountRupees;
        public float percentage;
    }

    /// <summary>
    /// Matches GET /api/analytics/summary response structure.
    /// </summary>
    [Serializable]
    public class AnalyticsSummaryData
    {
        public long totalExpenses;
        public float totalExpensesRupees;
        public long monthlyExpenses;
        public float monthlyExpensesRupees;
        public float averageMonthlySpendingRupees;
        public int totalTransactions;
        public HighestCategoryData highestSpendingCategory;
        public float netSavingsRupees;
        public string currentMonth;
    }

    [Serializable]
    public class AnalyticsSummaryResponse
    {
        public bool success;
        public AnalyticsSummaryData data;
    }

    /// <summary>
    /// Individual transaction item used for spatial HUD popup.
    /// </summary>
    [Serializable]
    public class TransactionRecord
    {
        public string id;
        public string title;
        public string category;
        public float amountRupees;
        public string date;
        public string note;

        public TransactionRecord(string id, string title, string category, float amountRupees, string date, string note = "")
        {
            this.id = id;
            this.title = title;
            this.category = category;
            this.amountRupees = amountRupees;
            this.date = date;
            this.note = note;
        }
    }

    /// <summary>
    /// Aggregated category spending data used directly by 3D ExpensePillars and AI Advisor.
    /// </summary>
    [Serializable]
    public class CategoryFinancialData
    {
        public string categoryName;
        public float totalSpentRupees;
        public float budgetLimitRupees;
        public int transactionCount;
        public float percentageOfTotal;
        public Color visualColor;
        public List<TransactionRecord> transactions = new List<TransactionRecord>();

        public bool IsOverBudget => totalSpentRupees > budgetLimitRupees;
        public float BudgetUtilizationRatio => budgetLimitRupees > 0f ? (totalSpentRupees / budgetLimitRupees) : 1f;

        public CategoryFinancialData(string name, float spent, float budget, Color color)
        {
            categoryName = name;
            totalSpentRupees = spent;
            budgetLimitRupees = budget;
            visualColor = color;
            transactions = new List<TransactionRecord>();
        }

        public void AddTransaction(string id, string title, float amount, string date)
        {
            transactions.Add(new TransactionRecord(id, title, categoryName, amount, date));
            transactionCount = transactions.Count;
        }

        public string GetFormattedSpending()
        {
            return $"₹{totalSpentRupees:N0}";
        }

        public string GetFormattedBudget()
        {
            return $"₹{budgetLimitRupees:N0}";
        }
    }

    /// <summary>
    /// Static helper providing academic benchmark evaluation dataset for offline demo & fallback.
    /// Exactly satisfies the 5 required evaluation categories:
    /// - Food: ₹4,200
    /// - Travel: ₹1,800
    /// - Bills: ₹3,500
    /// - Shopping: ₹2,100
    /// - Entertainment: ₹1,500
    /// Configured with standard ₹3,000 budget threshold (Y = 3 in 3D scene).
    /// </summary>
    public static class FinancialDataset
    {
        public const float DEFAULT_CATEGORY_BUDGET = 3000f;

        public static List<CategoryFinancialData> GetRequiredFiveCategories()
        {
            var list = new List<CategoryFinancialData>();

            // 1. Food: ₹4,200 (Over budget by ₹1,200)
            var food = new CategoryFinancialData("Food", 4200f, DEFAULT_CATEGORY_BUDGET, new Color(0.98f, 0.45f, 0.15f)); // Warm Coral
            food.AddTransaction("tx-101", "Weekly Supermarket Grocery Restock", 2150f, "2026-11-12");
            food.AddTransaction("tx-102", "Weekend Dining Out & Cafe Visits", 1450f, "2026-11-14");
            food.AddTransaction("tx-103", "Daily Espresso & Snack Bar", 600f, "2026-11-15");
            list.Add(food);

            // 2. Travel: ₹1,800 (Under budget by ₹1,200)
            var travel = new CategoryFinancialData("Travel", 1800f, DEFAULT_CATEGORY_BUDGET, new Color(0.06f, 0.75f, 0.85f)); // Vibrant Cyan
            travel.AddTransaction("tx-201", "Metro Smart Card Recharge", 800f, "2026-11-03");
            travel.AddTransaction("tx-202", "City Cab Ride Share", 650f, "2026-11-08");
            travel.AddTransaction("tx-203", "EV Charging Station Fee", 350f, "2026-11-13");
            list.Add(travel);

            // 3. Bills: ₹3,500 (Over budget by ₹500)
            var bills = new CategoryFinancialData("Bills", 3500f, DEFAULT_CATEGORY_BUDGET, new Color(0.65f, 0.25f, 0.95f)); // Deep Violet
            bills.AddTransaction("tx-301", "Residential Electricity Bill", 1950f, "2026-11-05");
            bills.AddTransaction("tx-302", "High-Speed Fiber Broadband", 1100f, "2026-11-07");
            bills.AddTransaction("tx-303", "Municipal Water Supply", 450f, "2026-11-10");
            list.Add(bills);

            // 4. Shopping: ₹2,100 (Under budget by ₹900)
            var shopping = new CategoryFinancialData("Shopping", 2100f, DEFAULT_CATEGORY_BUDGET, new Color(0.93f, 0.28f, 0.60f)); // Magenta Pink
            shopping.AddTransaction("tx-401", "Winter Apparel & Thermal Wear", 1350f, "2026-11-06");
            shopping.AddTransaction("tx-402", "Desk Ergonomics & Accessories", 750f, "2026-11-11");
            list.Add(shopping);

            // 5. Entertainment: ₹1,500 (Under budget by ₹1,500)
            var entertainment = new CategoryFinancialData("Entertainment", 1500f, DEFAULT_CATEGORY_BUDGET, new Color(0.92f, 0.70f, 0.05f)); // Warm Gold
            entertainment.AddTransaction("tx-501", "Cinema IMAX Tickets (2x)", 900f, "2026-11-09");
            entertainment.AddTransaction("tx-502", "OTT Streaming Subscription", 400f, "2026-11-12");
            entertainment.AddTransaction("tx-503", "Online Indie Game Purchase", 200f, "2026-11-14");
            list.Add(entertainment);

            // Compute total and percentages
            float total = 0f;
            foreach (var item in list) total += item.totalSpentRupees;
            foreach (var item in list)
            {
                item.percentageOfTotal = total > 0f ? (item.totalSpentRupees / total) * 100f : 0f;
            }

            return list;
        }
    }
}
