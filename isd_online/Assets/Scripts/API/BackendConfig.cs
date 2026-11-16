using System;
using UnityEngine;

namespace ISDOnline.Financial
{
    /// <summary>
    /// Configurable backend connection settings for UnityWebRequest communication.
    /// Supports local development, cloud deployments, and offline fallback.
    /// </summary>
    [Serializable]
    public class BackendConfig
    {
        [Header("API Connection Settings")]
        [Tooltip("Root endpoint of the Express backend API. Default: http://localhost:5001")]
        public string baseUrl = "http://localhost:5001";

        [Tooltip("Optional Bearer Authorization token if JWT authentication is enabled.")]
        public string authToken = "";

        [Tooltip("Network request timeout in seconds.")]
        [Range(1f, 30f)]
        public float requestTimeoutSeconds = 5.0f;

        [Header("Offline / Fallback Resilience")]
        [Tooltip("If checked, immediately use offline benchmark data without network requests.")]
        public bool forceOfflineMode = false;

        [Tooltip("Automatically fall back to local offline financial dataset when backend is unreachable.")]
        public bool autoFallbackOnConnectionFailure = true;

        [Header("API Endpoints")]
        public string categoryAnalyticsEndpoint = "/api/analytics/categories";
        public string expensesListEndpoint = "/api/expenses";
        public string summaryEndpoint = "/api/analytics/summary";
        public string healthEndpoint = "/api/health";

        public string GetCategoryAnalyticsUrl() => $"{baseUrl.TrimEnd('/')}{categoryAnalyticsEndpoint}";
        public string GetExpensesListUrl() => $"{baseUrl.TrimEnd('/')}{expensesListEndpoint}";
        public string GetSummaryUrl() => $"{baseUrl.TrimEnd('/')}{summaryEndpoint}";
        public string GetHealthUrl() => $"{baseUrl.TrimEnd('/')}{healthEndpoint}";
    }
}
