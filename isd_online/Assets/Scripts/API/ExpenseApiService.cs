using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;

namespace ISDOnline.Financial
{
    /// <summary>
    /// Manages HTTP communication between Unity and the Express/Prisma backend.
    /// Implements UnityWebRequest with JSON parsing, error handling, and seamless offline fallback.
    /// </summary>
    public class ExpenseApiService : MonoBehaviour
    {
        public static ExpenseApiService Instance { get; private set; }

        [SerializeField]
        private BackendConfig config = new BackendConfig();

        public BackendConfig Config => config;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
        }

        /// <summary>
        /// Fetches category-wise aggregated expense data from /api/analytics/categories.
        /// If offline or server is unreachable, delivers the academic 5-category evaluation dataset.
        /// </summary>
        public IEnumerator FetchCategoryData(Action<List<CategoryFinancialData>> onCompleted)
        {
            if (config.forceOfflineMode)
            {
                Debug.Log("[ExpenseApiService] ForceOfflineMode is active. Returning offline dataset.");
                onCompleted?.Invoke(FinancialDataset.GetRequiredFiveCategories());
                yield break;
            }

            string url = config.GetCategoryAnalyticsUrl();
            Debug.Log($"[ExpenseApiService] Requesting category analytics from: {url}");

            using (UnityWebRequest request = UnityWebRequest.Get(url))
            {
                request.timeout = Mathf.RoundToInt(config.requestTimeoutSeconds);
                request.SetRequestHeader("Accept", "application/json");

                if (!string.IsNullOrEmpty(config.authToken))
                {
                    request.SetRequestHeader("Authorization", $"Bearer {config.authToken}");
                }

                yield return request.SendWebRequest();

                bool isSuccess = request.result == UnityWebRequest.Result.Success;

                if (isSuccess)
                {
                    string json = request.downloadHandler.text;
                    Debug.Log($"[ExpenseApiService] API Response received ({json.Length} bytes)");

                    List<CategoryFinancialData> parsedCategories = ParseCategoryAnalyticsJson(json);
                    if (parsedCategories != null && parsedCategories.Count > 0)
                    {
                        onCompleted?.Invoke(parsedCategories);
                        yield break;
                    }
                }

                // If failed or returned empty data
                Debug.LogWarning($"[ExpenseApiService] Connection failed ({request.error}). Using offline fallback dataset.");
                if (config.autoFallbackOnConnectionFailure)
                {
                    onCompleted?.Invoke(FinancialDataset.GetRequiredFiveCategories());
                }
                else
                {
                    onCompleted?.Invoke(new List<CategoryFinancialData>());
                }
            }
        }

        /// <summary>
        /// Parses the JSON payload from /api/analytics/categories.
        /// Maps category amounts into Rupee values and assigns theme colors.
        /// </summary>
        private List<CategoryFinancialData> ParseCategoryAnalyticsJson(string json)
        {
            var list = new List<CategoryFinancialData>();
            try
            {
                CategoryAnalyticsResponse response = JsonUtility.FromJson<CategoryAnalyticsResponse>(json);
                if (response != null && response.data != null && response.data.Count > 0)
                {
                    Color[] palette = new Color[]
                    {
                        new Color(0.98f, 0.45f, 0.15f), // Food / Orange
                        new Color(0.06f, 0.75f, 0.85f), // Travel / Cyan
                        new Color(0.65f, 0.25f, 0.95f), // Bills / Violet
                        new Color(0.93f, 0.28f, 0.60f), // Shopping / Pink
                        new Color(0.92f, 0.70f, 0.05f), // Entertainment / Gold
                        new Color(0.08f, 0.75f, 0.50f), // Healthcare / Emerald
                    };

                    int index = 0;
                    foreach (var item in response.data)
                    {
                        float amount = item.amountRupees > 0f ? item.amountRupees : (item.amount / 100f);
                        Color color = palette[index % palette.Length];
                        var categoryData = new CategoryFinancialData(item.category, amount, FinancialDataset.DEFAULT_CATEGORY_BUDGET, color);
                        categoryData.percentageOfTotal = item.percentage;
                        categoryData.transactionCount = item.count;
                        list.Add(categoryData);
                        index++;
                    }
                    return list;
                }
            }
            catch (Exception ex)
            {
                Debug.LogError($"[ExpenseApiService] JSON parsing error: {ex.Message}. Falling back to default parser.");
            }
            return null;
        }

        /// <summary>
        /// Fetches high-level financial summary analytics from /api/analytics/summary.
        /// </summary>
        public IEnumerator FetchSummary(Action<AnalyticsSummaryData> onCompleted)
        {
            if (config.forceOfflineMode)
            {
                onCompleted?.Invoke(CreateOfflineSummary());
                yield break;
            }

            string url = config.GetSummaryUrl();
            using (UnityWebRequest request = UnityWebRequest.Get(url))
            {
                request.timeout = Mathf.RoundToInt(config.requestTimeoutSeconds);
                request.SetRequestHeader("Accept", "application/json");

                if (!string.IsNullOrEmpty(config.authToken))
                {
                    request.SetRequestHeader("Authorization", $"Bearer {config.authToken}");
                }

                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    try
                    {
                        string json = request.downloadHandler.text;
                        AnalyticsSummaryResponse response = JsonUtility.FromJson<AnalyticsSummaryResponse>(json);
                        if (response != null && response.data != null)
                        {
                            onCompleted?.Invoke(response.data);
                            yield break;
                        }
                    }
                    catch (Exception ex)
                    {
                        Debug.LogWarning($"[ExpenseApiService] Failed to parse summary: {ex.Message}");
                    }
                }

                onCompleted?.Invoke(CreateOfflineSummary());
            }
        }

        private AnalyticsSummaryData CreateOfflineSummary()
        {
            var summary = new AnalyticsSummaryData
            {
                totalExpensesRupees = 13100f,
                monthlyExpensesRupees = 13100f,
                averageMonthlySpendingRupees = 13100f,
                totalTransactions = 15,
                netSavingsRupees = 6900f,
                currentMonth = "November 2026",
                highestSpendingCategory = new HighestCategoryData
                {
                    category = "Food",
                    amountRupees = 4200f,
                    percentage = 32.1f
                }
            };
            return summary;
        }
    }
}
