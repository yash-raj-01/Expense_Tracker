using System;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

namespace ISDOnline.Financial
{
    /// <summary>
    /// Floating 3D Transaction HUD panel that opens upon selecting an Expense Pillar.
    /// Displays category statistics, budget variance, and detailed itemized transactions.
    /// Features smooth billboard orientation facing the viewer and responsive dismiss controls.
    /// </summary>
    public class TransactionHUD : MonoBehaviour
    {
        public static TransactionHUD Instance { get; private set; }

        [Header("UI Component References")]
        [SerializeField] private TextMeshPro titleText;
        [SerializeField] private TextMeshPro statsText;
        [SerializeField] private TextMeshPro transactionsListText;
        [SerializeField] private GameObject hudRoot;
        [SerializeField] private GameObject backgroundPlane;

        [Header("Visual Styling")]
        [SerializeField] private Material backgroundMaterial;
        [SerializeField] private Color headerCyan = new Color(0.0f, 0.94f, 1.0f);
        [SerializeField] private Color warningRed = new Color(1.0f, 0.3f, 0.35f);
        [SerializeField] private Color successGreen = new Color(0.1f, 0.9f, 0.5f);

        private PillarInteraction currentlySelectedPillar;
        private Transform cameraTransform;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;

            if (hudRoot == null)
            {
                BuildHUDHierarchy();
            }
        }

        private void Start()
        {
            if (Camera.main != null)
            {
                cameraTransform = Camera.main.transform;
            }
            Hide();
        }

        private void LateUpdate()
        {
            if (hudRoot != null && hudRoot.activeSelf)
            {
                if (cameraTransform == null && Camera.main != null)
                {
                    cameraTransform = Camera.main.transform;
                }

                if (cameraTransform != null)
                {
                    // Face camera smoothly
                    Vector3 targetDir = hudRoot.transform.position - cameraTransform.position;
                    if (targetDir != Vector3.zero)
                    {
                        hudRoot.transform.rotation = Quaternion.LookRotation(targetDir);
                    }
                }

                // Check escape key or click to dismiss
                if (Input.GetKeyDown(KeyCode.Escape) || Input.GetMouseButtonDown(1))
                {
                    Hide();
                }
            }
        }

        /// <summary>
        /// Populates and displays the HUD card for a selected financial category.
        /// </summary>
        public void ShowCategoryDetails(CategoryFinancialData data, Vector3 worldPosition, PillarInteraction caller = null)
        {
            if (currentlySelectedPillar != null && currentlySelectedPillar != caller)
            {
                currentlySelectedPillar.Deselect();
            }
            currentlySelectedPillar = caller;

            if (hudRoot == null) BuildHUDHierarchy();

            hudRoot.transform.position = worldPosition;
            hudRoot.SetActive(true);

            // Populate Category Title
            if (titleText != null)
            {
                titleText.text = $"<color=#{ColorUtility.ToHtmlStringRGB(data.visualColor)}>●</color> <b>{data.categoryName.ToUpper()}</b>";
            }

            // Populate Metrics & Budget comparison
            if (statsText != null)
            {
                bool overBudget = data.IsOverBudget;
                float diff = Mathf.Abs(data.totalSpentRupees - data.budgetLimitRupees);
                string varianceStr = overBudget
                    ? $"<color=#FF4554>▲ Over Budget by ₹{diff:N0} ({data.BudgetUtilizationRatio * 100f:0}%)</color>"
                    : $"<color=#00E676>✓ Under Budget by ₹{diff:N0} ({data.BudgetUtilizationRatio * 100f:0}%)</color>";

                statsText.text = $"Total Spent: <b>₹{data.totalSpentRupees:N0}</b>  |  Budget: <b>₹{data.budgetLimitRupees:N0}</b>\n{varianceStr}";
            }

            // Populate Itemized Transactions List
            if (transactionsListText != null)
            {
                if (data.transactions != null && data.transactions.Count > 0)
                {
                    System.Text.StringBuilder sb = new System.Text.StringBuilder();
                    sb.AppendLine("<size=80%><b>ITEMIZED TRANSACTIONS</b></size>");
                    foreach (var tx in data.transactions)
                    {
                        sb.AppendLine($"<color=#B0BEC5>{tx.date}</color>  <b>{tx.title}</b>  <color=#00F0FF>₹{tx.amountRupees:N0}</color>");
                    }
                    transactionsListText.text = sb.ToString();
                }
                else
                {
                    transactionsListText.text = $"<size=80%><b>ITEMIZED TRANSACTIONS</b></size>\n<color=#B0BEC5>No individual transaction logs recorded for this category.</color>";
                }
            }
        }

        public void Hide()
        {
            if (currentlySelectedPillar != null)
            {
                currentlySelectedPillar.Deselect();
                currentlySelectedPillar = null;
            }

            if (hudRoot != null)
            {
                hudRoot.SetActive(false);
            }
        }

        /// <summary>
        /// Procedurally constructs the 3D HUD hierarchy if not loaded from a prefab.
        /// </summary>
        private void BuildHUDHierarchy()
        {
            hudRoot = new GameObject("HUD_CardRoot");
            hudRoot.transform.SetParent(this.transform, false);

            // Background Card
            backgroundPlane = GameObject.CreatePrimitive(PrimitiveType.Cube);
            backgroundPlane.name = "HUD_Background";
            backgroundPlane.transform.SetParent(hudRoot.transform, false);
            backgroundPlane.transform.localScale = new Vector3(3.6f, 2.4f, 0.05f);

            Renderer bgRenderer = backgroundPlane.GetComponent<Renderer>();
            if (bgRenderer != null)
            {
                Material bgMat = new Material(Shader.Find("Standard"));
                bgMat.color = new Color(0.04f, 0.08f, 0.14f, 0.92f);
                bgMat.SetFloat("_Mode", 3);
                bgMat.SetFloat("_Glossiness", 0.7f);
                bgMat.SetFloat("_Metallic", 0.4f);
                bgRenderer.material = bgMat;
            }

            // Title Text
            GameObject titleObj = new GameObject("HUD_Title");
            titleObj.transform.SetParent(hudRoot.transform, false);
            titleObj.transform.localPosition = new Vector3(0f, 0.9f, -0.04f);
            titleText = titleObj.AddComponent<TextMeshPro>();
            titleText.fontSize = 3.6f;
            titleText.alignment = TextAlignmentOptions.Center;
            titleText.text = "CATEGORY DETAILS";

            // Stats Text
            GameObject statsObj = new GameObject("HUD_Stats");
            statsObj.transform.SetParent(hudRoot.transform, false);
            statsObj.transform.localPosition = new Vector3(0f, 0.55f, -0.04f);
            statsText = statsObj.AddComponent<TextMeshPro>();
            statsText.fontSize = 2.4f;
            statsText.alignment = TextAlignmentOptions.Center;
            statsText.text = "Spending Breakdown";

            // Transactions List
            GameObject listObj = new GameObject("HUD_TransactionsList");
            listObj.transform.SetParent(hudRoot.transform, false);
            listObj.transform.localPosition = new Vector3(0f, -0.1f, -0.04f);
            transactionsListText = listObj.AddComponent<TextMeshPro>();
            transactionsListText.fontSize = 1.9f;
            transactionsListText.alignment = TextAlignmentOptions.Center;
            transactionsListText.text = "Transactions...";

            // Close Hint
            GameObject closeObj = new GameObject("HUD_CloseHint");
            closeObj.transform.SetParent(hudRoot.transform, false);
            closeObj.transform.localPosition = new Vector3(0f, -0.98f, -0.04f);
            TextMeshPro closeText = closeObj.AddComponent<TextMeshPro>();
            closeText.fontSize = 1.6f;
            closeText.alignment = TextAlignmentOptions.Center;
            closeText.text = "<color=#78909C>[Right Click or Esc to Dismiss]</color>";
        }
    }
}
