using System;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

namespace ISDOnline.Financial
{
    /// <summary>
    /// Glowing cyan floating AI Advisor orb with dynamic harmonic oscillation,
    /// pulse emissions, predictive financial reasoning heuristics, and a 3D information board.
    /// </summary>
    public class AIAdvisorOrb : MonoBehaviour
    {
        [Header("Visual Hover & Animation")]
        [SerializeField] private float hoverAmplitude = 0.22f;
        [SerializeField] private float hoverFrequency = 1.4f;
        [SerializeField] private float rotationSpeed = 24f;
        [SerializeField] private float pulseFrequency = 2.8f;

        [Header("Appearance & Colors")]
        [SerializeField] private Color cyanCoreColor = new Color(0.0f, 0.9f, 1.0f);
        [SerializeField] private Color cyanEmissionColor = new Color(0.0f, 0.75f, 1.0f);
        [SerializeField] private Material orbMaterial;

        [Header("Information Board Binding")]
        [SerializeField] private GameObject infoBoardRoot;
        [SerializeField] private TextMeshPro infoBoardHeader;
        [SerializeField] private TextMeshPro infoBoardMetrics;
        [SerializeField] private TextMeshPro infoBoardRecommendations;

        [Header("Connected Visualizer")]
        [SerializeField] private ExpenseVisualizer visualizer;

        private Vector3 startPosition;
        private Renderer orbRenderer;
        private Material runtimeOrbMat;
        private GameObject haloRing;
        private IAIFinancialAdvisorEngine reasoningEngine;

        private void Awake()
        {
            reasoningEngine = new RuleBasedAdvisorEngine();
        }

        private void Start()
        {
            startPosition = transform.position;
            SetupOrbVisuals();

            if (infoBoardRoot == null)
            {
                Build3DInfoBoard();
            }

            // Bind to ExpenseVisualizer data updates
            if (visualizer == null)
            {
                visualizer = FindObjectOfType<ExpenseVisualizer>();
            }

            if (visualizer != null)
            {
                visualizer.OnFinancialDataLoaded += HandleFinancialDataReceived;
                if (visualizer.CurrentData != null && visualizer.CurrentData.Count > 0)
                {
                    HandleFinancialDataReceived(visualizer.CurrentData);
                }
            }
            else
            {
                // Fallback direct analysis
                HandleFinancialDataReceived(FinancialDataset.GetRequiredFiveCategories());
            }
        }

        private void OnDestroy()
        {
            if (visualizer != null)
            {
                visualizer.OnFinancialDataLoaded -= HandleFinancialDataReceived;
            }
        }

        private void Update()
        {
            AnimateFloatingAndPulse();
        }

        private void SetupOrbVisuals()
        {
            orbRenderer = GetComponent<Renderer>();
            if (orbRenderer == null)
            {
                // Add sphere geometry if not present
                GameObject sphere = GameObject.CreatePrimitive(PrimitiveType.Sphere);
                sphere.name = "OrbGeometry";
                sphere.transform.SetParent(this.transform, false);
                sphere.transform.localScale = Vector3.one * 1.1f;
                orbRenderer = sphere.GetComponent<Renderer>();
            }

            if (orbRenderer != null)
            {
                if (orbMaterial != null)
                {
                    runtimeOrbMat = new Material(orbMaterial);
                }
                else
                {
                    runtimeOrbMat = new Material(Shader.Find("Standard"));
                    runtimeOrbMat.color = cyanCoreColor;
                    runtimeOrbMat.EnableKeyword("_EMISSION");
                    runtimeOrbMat.SetFloat("_Metallic", 0.3f);
                    runtimeOrbMat.SetFloat("_Glossiness", 0.9f);
                }
                runtimeOrbMat.SetColor("_EmissionColor", cyanEmissionColor * 2.2f);
                orbRenderer.material = runtimeOrbMat;
            }

            // Create spinning orbital energy halo
            haloRing = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            haloRing.name = "EnergyHaloRing";
            haloRing.transform.SetParent(this.transform, false);
            haloRing.transform.localScale = new Vector3(1.7f, 0.02f, 1.7f);
            haloRing.transform.localRotation = Quaternion.Euler(25f, 0f, 15f);

            Collider col = haloRing.GetComponent<Collider>();
            if (col != null) Destroy(col);

            Renderer ringR = haloRing.GetComponent<Renderer>();
            if (ringR != null)
            {
                Material m = new Material(Shader.Find("Standard"));
                m.color = new Color(0.1f, 0.95f, 1.0f, 0.7f);
                m.EnableKeyword("_EMISSION");
                m.SetColor("_EmissionColor", new Color(0.0f, 0.8f, 1.0f) * 1.8f);
                ringR.material = m;
            }
        }

        private void AnimateFloatingAndPulse()
        {
            // Harmonic vertical float
            float newY = startPosition.y + Mathf.Sin(Time.time * hoverFrequency) * hoverAmplitude;
            transform.position = new Vector3(startPosition.x, newY, startPosition.z);

            // Slow aesthetic rotation
            transform.Rotate(Vector3.up, rotationSpeed * Time.deltaTime, Space.World);

            if (haloRing != null)
            {
                haloRing.transform.Rotate(Vector3.up, -rotationSpeed * 1.6f * Time.deltaTime, Space.Self);
            }

            // Breathing pulse emission
            if (runtimeOrbMat != null)
            {
                float pulse = 1.0f + 0.35f * Mathf.Sin(Time.time * pulseFrequency);
                runtimeOrbMat.SetColor("_EmissionColor", cyanEmissionColor * (1.8f * pulse));
            }
        }

        public void HandleFinancialDataReceived(List<CategoryFinancialData> categories)
        {
            if (reasoningEngine == null) reasoningEngine = new RuleBasedAdvisorEngine();

            float budgetLimit = visualizer != null ? visualizer.BudgetThresholdRupees : FinancialDataset.DEFAULT_CATEGORY_BUDGET;
            FinancialAnalysisReport report = reasoningEngine.Analyze(categories, budgetLimit);

            UpdateInfoBoardUI(report);
        }

        private void UpdateInfoBoardUI(FinancialAnalysisReport report)
        {
            if (infoBoardHeader != null)
            {
                infoBoardHeader.text = "<b><color=#00F0FF>◈ AI FINANCIAL ADVISOR</color></b>\n<size=70%>REAL-TIME PORTFOLIO HEURISTICS</size>";
            }

            if (infoBoardMetrics != null)
            {
                infoBoardMetrics.text =
                    $"Total Spend: <b><color=#FFFFFF>{report.GetFormattedTotalSpent()}</color></b>   " +
                    $"Status: {report.budgetHealthStatus}\n" +
                    $"Top Category: <b><color=#FF9800>{report.highestCategory}</color></b> (₹{report.highestCategoryAmount:N0} • {report.highestCategoryPercentage:0.1}%)\n" +
                    $"Projected EOM Spend: <b><color=#00F0FF>{report.GetFormattedProjectedEOM()}</color></b> (Linear Run-Rate)";
            }

            if (infoBoardRecommendations != null)
            {
                System.Text.StringBuilder sb = new System.Text.StringBuilder();
                sb.AppendLine("<b>ACTIONABLE SAVING INSIGHTS:</b>");
                foreach (var rec in report.recommendations)
                {
                    sb.AppendLine($"<size=90%>{rec}</size>");
                }
                infoBoardRecommendations.text = sb.ToString();
            }
        }

        /// <summary>
        /// Procedurally constructs the floating 3D information board next to the AI Advisor.
        /// </summary>
        private void Build3DInfoBoard()
        {
            infoBoardRoot = new GameObject("AI_Advisor_InfoBoard");
            infoBoardRoot.transform.SetParent(this.transform.parent != null ? this.transform.parent : null);
            // Positioned to the side and slightly forward of the orb
            infoBoardRoot.transform.position = transform.position + new Vector3(3.2f, 0.4f, 0.2f);
            infoBoardRoot.transform.rotation = Quaternion.Euler(0f, -20f, 0f);

            // Card background mesh
            GameObject board = GameObject.CreatePrimitive(PrimitiveType.Cube);
            board.name = "BoardPanel";
            board.transform.SetParent(infoBoardRoot.transform, false);
            board.transform.localScale = new Vector3(4.8f, 3.2f, 0.06f);

            Renderer bRenderer = board.GetComponent<Renderer>();
            if (bRenderer != null)
            {
                Material m = new Material(Shader.Find("Standard"));
                m.color = new Color(0.04f, 0.08f, 0.14f, 0.92f);
                m.SetFloat("_Glossiness", 0.6f);
                m.SetFloat("_Metallic", 0.5f);
                m.EnableKeyword("_EMISSION");
                m.SetColor("_EmissionColor", new Color(0.0f, 0.15f, 0.22f));
                bRenderer.material = m;
            }

            // Edge glowing border
            GameObject border = GameObject.CreatePrimitive(PrimitiveType.Cube);
            border.name = "BoardBorder";
            border.transform.SetParent(infoBoardRoot.transform, false);
            border.transform.localScale = new Vector3(4.86f, 3.26f, 0.03f);
            border.transform.localPosition = new Vector3(0f, 0f, 0.02f);
            Renderer borderR = border.GetComponent<Renderer>();
            if (borderR != null)
            {
                Material bm = new Material(Shader.Find("Standard"));
                bm.color = cyanCoreColor;
                bm.EnableKeyword("_EMISSION");
                bm.SetColor("_EmissionColor", cyanCoreColor * 1.2f);
                borderR.material = bm;
            }
            Collider borderCol = border.GetComponent<Collider>();
            if (borderCol != null) Destroy(borderCol);

            // Header Text
            GameObject headerObj = new GameObject("Board_Header");
            headerObj.transform.SetParent(infoBoardRoot.transform, false);
            headerObj.transform.localPosition = new Vector3(0f, 1.22f, -0.05f);
            infoBoardHeader = headerObj.AddComponent<TextMeshPro>();
            infoBoardHeader.fontSize = 3.6f;
            infoBoardHeader.alignment = TextAlignmentOptions.Center;
            infoBoardHeader.text = "<b><color=#00F0FF>◈ AI FINANCIAL ADVISOR</color></b>";

            // Metrics Text
            GameObject metricsObj = new GameObject("Board_Metrics");
            metricsObj.transform.SetParent(infoBoardRoot.transform, false);
            metricsObj.transform.localPosition = new Vector3(0f, 0.45f, -0.05f);
            infoBoardMetrics = metricsObj.AddComponent<TextMeshPro>();
            infoBoardMetrics.fontSize = 2.4f;
            infoBoardMetrics.alignment = TextAlignmentOptions.Center;
            infoBoardMetrics.text = "Calculating Portfolio Metrics...";

            // Recommendations Text
            GameObject recObj = new GameObject("Board_Recommendations");
            recObj.transform.SetParent(infoBoardRoot.transform, false);
            recObj.transform.localPosition = new Vector3(0f, -0.65f, -0.05f);
            infoBoardRecommendations = recObj.AddComponent<TextMeshPro>();
            infoBoardRecommendations.fontSize = 2.0f;
            infoBoardRecommendations.alignment = TextAlignmentOptions.Left;
            infoBoardRecommendations.margin = new Vector4(0.3f, 0.1f, 0.3f, 0.1f);
            infoBoardRecommendations.text = "Generating Saving Recommendations...";
        }
    }
}
