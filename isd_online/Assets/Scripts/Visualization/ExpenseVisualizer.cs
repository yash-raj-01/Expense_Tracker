using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

namespace ISDOnline.Financial
{
    /// <summary>
    /// Procedurally creates and animates 3D financial expense pillars.
    /// Manages height scaling, over-budget warning thresholds, 3D typography labels,
    /// and data binding with the backend API or offline fallback.
    /// </summary>
    public class ExpenseVisualizer : MonoBehaviour
    {
        [Header("Scene Layout & Positioning")]
        [Tooltip("Horizontal spacing between consecutive expense pillars.")]
        [SerializeField] private float pillarSpacing = 2.2f;

        [Tooltip("Starting Z coordinate offset for the row of pillars.")]
        [SerializeField] private float rowZOffset = 0f;

        [Header("Height Scaling & Budget")]
        [Tooltip("World height in Unity meters per Rupee. E.g. 0.001f maps ₹3,000 to 3.0m.")]
        [SerializeField] private float heightScale = 0.001f;

        [Tooltip("Monthly category budget limit in Rupees. Default ₹3,000 maps to Y = 3.0m.")]
        [SerializeField] private float budgetThresholdRupees = 3000f;

        [Tooltip("World height of the horizontal budget warning plane.")]
        [SerializeField] private float budgetPlaneY = 3.0f;

        [Header("Animation")]
        [Tooltip("Duration of the rising pillar animation in seconds.")]
        [Range(0.5f, 3.0f)]
        [SerializeField] private float animationDuration = 1.2f;

        [Header("Materials")]
        [SerializeField] private Material defaultPillarMaterial;
        [SerializeField] private Material overBudgetMaterial;
        [SerializeField] private Material highlightMaterial;

        [Header("Events")]
        public event Action<List<CategoryFinancialData>> OnFinancialDataLoaded;

        private List<GameObject> activePillars = new List<GameObject>();
        private List<CategoryFinancialData> currentData = new List<CategoryFinancialData>();

        public List<CategoryFinancialData> CurrentData => currentData;
        public float BudgetThresholdRupees => budgetThresholdRupees;
        public float HeightScale => heightScale;

        private void Start()
        {
            StartCoroutine(LoadAndVisualizeExpenses());
        }

        /// <summary>
        /// Initiates data retrieval from the backend API (or fallback) and spawns 3D pillars.
        /// </summary>
        public IEnumerator LoadAndVisualizeExpenses()
        {
            if (ExpenseApiService.Instance == null)
            {
                Debug.LogWarning("[ExpenseVisualizer] No ExpenseApiService found. Spawning offline benchmark data.");
                RenderDataset(FinancialDataset.GetRequiredFiveCategories());
                yield break;
            }

            bool dataReceived = false;
            List<CategoryFinancialData> loadedData = null;

            yield return ExpenseApiService.Instance.FetchCategoryData((categories) =>
            {
                loadedData = categories;
                dataReceived = true;
            });

            if (dataReceived && loadedData != null && loadedData.Count > 0)
            {
                RenderDataset(loadedData);
            }
            else
            {
                Debug.LogWarning("[ExpenseVisualizer] Received null or empty dataset. Using fallback.");
                RenderDataset(FinancialDataset.GetRequiredFiveCategories());
            }
        }

        /// <summary>
        /// Clears existing pillars and renders the given category dataset.
        /// </summary>
        public void RenderDataset(List<CategoryFinancialData> categories)
        {
            currentData = categories;

            // Clear previous pillars
            foreach (var pillar in activePillars)
            {
                if (pillar != null) Destroy(pillar);
            }
            activePillars.Clear();

            int count = categories.Count;
            float totalWidth = (count - 1) * pillarSpacing;
            float startX = -totalWidth / 2f;

            for (int i = 0; i < count; i++)
            {
                CategoryFinancialData data = categories[i];
                float posX = startX + (i * pillarSpacing);
                Vector3 spawnPos = new Vector3(posX, 0f, rowZOffset);

                GameObject pillarObj = CreatePillarObject(data, spawnPos, i);
                activePillars.Add(pillarObj);
            }

            OnFinancialDataLoaded?.Invoke(currentData);
        }

        /// <summary>
        /// Constructs a single 3D pillar GameObject with its geometry, materials, labels, and interactions.
        /// </summary>
        private GameObject CreatePillarObject(CategoryFinancialData data, Vector3 position, int index)
        {
            GameObject container = new GameObject($"Pillar_{data.categoryName}_{index}");
            container.transform.position = position;
            container.transform.SetParent(this.transform);

            // Create 3D Cylinder geometry for the pillar column
            GameObject column = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            column.name = "PillarGeometry";
            column.transform.SetParent(container.transform, false);

            // Remove default capsule collider and add box collider for precise raycasting
            Collider defaultCollider = column.GetComponent<Collider>();
            if (defaultCollider != null) Destroy(defaultCollider);
            BoxCollider boxCollider = column.AddComponent<BoxCollider>();

            float targetHeight = Mathf.Max(0.2f, data.totalSpentRupees * heightScale);
            bool isOverBudget = data.totalSpentRupees > budgetThresholdRupees;

            // Base radius 0.45m
            column.transform.localScale = new Vector3(0.9f, 0.001f, 0.9f);
            column.transform.localPosition = new Vector3(0f, 0f, 0f);

            // Assign Material with custom color / warning highlight
            Renderer renderer = column.GetComponent<Renderer>();
            if (renderer != null)
            {
                Material matInstance;
                if (isOverBudget && overBudgetMaterial != null)
                {
                    matInstance = new Material(overBudgetMaterial);
                }
                else if (defaultPillarMaterial != null)
                {
                    matInstance = new Material(defaultPillarMaterial);
                }
                else
                {
                    matInstance = new Material(Shader.Find("Standard"));
                }

                matInstance.color = isOverBudget ? new Color(1.0f, 0.25f, 0.25f) : data.visualColor;
                matInstance.EnableKeyword("_EMISSION");
                Color emissionColor = isOverBudget ? new Color(0.8f, 0.1f, 0.15f) : (data.visualColor * 0.4f);
                matInstance.SetColor("_EmissionColor", emissionColor);
                renderer.material = matInstance;
            }

            // Create 3D Pedestal / Base ring
            GameObject pedestal = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            pedestal.name = "Pedestal";
            pedestal.transform.SetParent(container.transform, false);
            pedestal.transform.localScale = new Vector3(1.1f, 0.06f, 1.1f);
            pedestal.transform.localPosition = new Vector3(0f, 0.03f, 0f);
            Renderer pedRenderer = pedestal.GetComponent<Renderer>();
            if (pedRenderer != null)
            {
                Material pedMat = new Material(Shader.Find("Standard"));
                pedMat.color = new Color(0.12f, 0.16f, 0.24f);
                pedMat.SetFloat("_Metallic", 0.8f);
                pedMat.SetFloat("_Glossiness", 0.6f);
                pedRenderer.material = pedMat;
            }
            Collider pedCollider = pedestal.GetComponent<Collider>();
            if (pedCollider != null) Destroy(pedCollider);

            // Add Warning Crown if over budget
            if (isOverBudget)
            {
                CreateWarningIndicator(container.transform, targetHeight);
            }

            // Create Floating 3D TextMeshPro Label
            CreateFloatingLabel(container.transform, data, targetHeight, isOverBudget);

            // Attach interaction component
            PillarInteraction interaction = container.AddComponent<PillarInteraction>();
            interaction.Initialize(data, column, isOverBudget, highlightMaterial);

            // Animate pillar rising smoothly
            StartCoroutine(AnimatePillarRise(column, boxCollider, targetHeight, index * 0.12f));

            return container;
        }

        /// <summary>
        /// Creates an emissive warning ring around pillars exceeding the budget limit.
        /// </summary>
        private void CreateWarningIndicator(Transform parent, float targetHeight)
        {
            GameObject indicator = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            indicator.name = "BudgetWarningRing";
            indicator.transform.SetParent(parent, false);
            indicator.transform.localScale = new Vector3(1.05f, 0.04f, 1.05f);
            indicator.transform.localPosition = new Vector3(0f, budgetPlaneY, 0f);

            Renderer ringRenderer = indicator.GetComponent<Renderer>();
            if (ringRenderer != null)
            {
                Material ringMat = new Material(Shader.Find("Standard"));
                ringMat.color = Color.red;
                ringMat.EnableKeyword("_EMISSION");
                ringMat.SetColor("_EmissionColor", Color.red * 2.0f);
                ringRenderer.material = ringMat;
            }

            Collider col = indicator.GetComponent<Collider>();
            if (col != null) Destroy(col);
        }

        /// <summary>
        /// Creates a 3D billboard TextMeshPro label above the pillar showing category and amount.
        /// </summary>
        private void CreateFloatingLabel(Transform parent, CategoryFinancialData data, float targetHeight, bool isOverBudget)
        {
            GameObject labelObj = new GameObject("FloatingPillarLabel");
            labelObj.transform.SetParent(parent, false);
            labelObj.transform.localPosition = new Vector3(0f, targetHeight + 0.45f, 0f);

            TextMeshPro text = labelObj.AddComponent<TextMeshPro>();
            text.fontSize = 3.6f;
            text.alignment = TextAlignmentOptions.Center;
            text.enableWordWrapping = false;

            string statusColor = isOverBudget ? "#FF4B4B" : "#00F0FF";
            string statusText = isOverBudget
                ? $"<color=#FF4444>▲ +₹{data.totalSpentRupees - budgetThresholdRupees:N0} Over</color>"
                : $"<color=#00E676>✓ ₹{budgetThresholdRupees - data.totalSpentRupees:N0} Left</color>";

            text.text = $"<b>{data.categoryName}</b>\n<size=85%>₹{data.totalSpentRupees:N0}</size>\n<size=65%>{statusText}</size>";
            text.color = Color.white;

            // Simple billboard behavior component
            labelObj.AddComponent<BillboardLookAtCamera>();
        }

        /// <summary>
        /// Smoothly animates pillar height from zero to target height using smooth ease-out interpolation.
        /// </summary>
        private IEnumerator AnimatePillarRise(GameObject column, BoxCollider collider, float targetHeight, float delay)
        {
            if (delay > 0f) yield return new WaitForSeconds(delay);

            float elapsed = 0f;
            float duration = Mathf.Max(0.4f, animationDuration);

            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                float t = Mathf.Clamp01(elapsed / duration);

                // Smooth quad ease out
                float smoothT = 1f - Mathf.Pow(1f - t, 2.5f);
                float currentH = Mathf.Lerp(0.01f, targetHeight, smoothT);

                // Cylinder default primitive height is 2.0, so localScale.y = currentH / 2.0
                column.transform.localScale = new Vector3(0.9f, currentH / 2f, 0.9f);
                column.transform.localPosition = new Vector3(0f, currentH / 2f, 0f);

                yield return null;
            }

            // Final state
            column.transform.localScale = new Vector3(0.9f, targetHeight / 2f, 0.9f);
            column.transform.localPosition = new Vector3(0f, targetHeight / 2f, 0f);
        }
    }

    /// <summary>
    /// Helper script keeping floating 3D text labels oriented towards the main camera.
    /// </summary>
    public class BillboardLookAtCamera : MonoBehaviour
    {
        private Transform mainCamTransform;

        private void Start()
        {
            if (Camera.main != null)
            {
                mainCamTransform = Camera.main.transform;
            }
        }

        private void LateUpdate()
        {
            if (mainCamTransform == null && Camera.main != null)
            {
                mainCamTransform = Camera.main.transform;
            }

            if (mainCamTransform != null)
            {
                // Face camera while keeping vertical orientation
                Vector3 target = transform.position + mainCamTransform.rotation * Vector3.forward;
                Vector3 up = mainCamTransform.rotation * Vector3.up;
                transform.LookAt(target, up);
            }
        }
    }
}
