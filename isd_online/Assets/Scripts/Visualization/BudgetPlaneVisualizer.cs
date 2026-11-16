using System.Collections;
using UnityEngine;
using TMPro;

namespace ISDOnline.Financial
{
    /// <summary>
    /// Renders the red translucent horizontal budget threshold plane at Y = 3.0.
    /// Features glowing edge lines, subtle animation pulse, and floating budget markers.
    /// </summary>
    public class BudgetPlaneVisualizer : MonoBehaviour
    {
        [Header("Budget Plane Dimensions")]
        [SerializeField] private float planeWidth = 16f;
        [SerializeField] private float planeDepth = 8f;
        [SerializeField] private float thresholdHeightY = 3.0f;

        [Header("Appearance")]
        [SerializeField] private Color planeColor = new Color(1.0f, 0.15f, 0.25f, 0.22f);
        [SerializeField] private Color edgeColor = new Color(1.0f, 0.3f, 0.35f, 0.85f);
        [SerializeField] private Material planeMaterial;

        [Header("Budget Display")]
        [SerializeField] private float budgetAmountRupees = 3000f;

        private GameObject planeMeshObj;
        private Material runtimePlaneMaterial;

        private void Awake()
        {
            BuildBudgetPlane();
        }

        private void BuildBudgetPlane()
        {
            transform.position = new Vector3(0f, thresholdHeightY, 0f);

            // Create flat quad or cube for the translucent sheet
            planeMeshObj = GameObject.CreatePrimitive(PrimitiveType.Cube);
            planeMeshObj.name = "BudgetPlaneMesh";
            planeMeshObj.transform.SetParent(this.transform, false);
            planeMeshObj.transform.localScale = new Vector3(planeWidth, 0.02f, planeDepth);
            planeMeshObj.transform.localPosition = Vector3.zero;

            // Remove collider so it doesn't block raycasts to pillars
            Collider col = planeMeshObj.GetComponent<Collider>();
            if (col != null) Destroy(col);

            Renderer renderer = planeMeshObj.GetComponent<Renderer>();
            if (renderer != null)
            {
                if (planeMaterial != null)
                {
                    runtimePlaneMaterial = new Material(planeMaterial);
                }
                else
                {
                    runtimePlaneMaterial = new Material(Shader.Find("Standard"));
                    runtimePlaneMaterial.SetFloat("_Mode", 3); // Transparent
                    runtimePlaneMaterial.SetInt("_SrcBlend", (int)UnityEngine.Rendering.BlendMode.SrcAlpha);
                    runtimePlaneMaterial.SetInt("_DstBlend", (int)UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);
                    runtimePlaneMaterial.SetInt("_ZWrite", 0);
                    runtimePlaneMaterial.DisableKeyword("_ALPHATEST_ON");
                    runtimePlaneMaterial.EnableKeyword("_ALPHABLEND_ON");
                    runtimePlaneMaterial.DisableKeyword("_ALPHAPREMULTIPLY_ON");
                    runtimePlaneMaterial.renderQueue = 3000;
                }

                runtimePlaneMaterial.color = planeColor;
                runtimePlaneMaterial.EnableKeyword("_EMISSION");
                runtimePlaneMaterial.SetColor("_EmissionColor", edgeColor * 0.35f);
                renderer.material = runtimePlaneMaterial;
            }

            // Create glowing boundary lines on the front and back
            CreateEdgeGlow(new Vector3(0f, 0f, planeDepth / 2f), new Vector3(planeWidth, 0.04f, 0.04f));
            CreateEdgeGlow(new Vector3(0f, 0f, -planeDepth / 2f), new Vector3(planeWidth, 0.04f, 0.04f));

            // Create 3D Floating Budget Markers on the sides
            CreateBudgetBadge(new Vector3(-planeWidth / 2f + 1.2f, 0.25f, -planeDepth / 2f + 0.5f));
            CreateBudgetBadge(new Vector3(planeWidth / 2f - 1.2f, 0.25f, -planeDepth / 2f + 0.5f));
        }

        private void CreateEdgeGlow(Vector3 localPos, Vector3 scale)
        {
            GameObject edge = GameObject.CreatePrimitive(PrimitiveType.Cube);
            edge.name = "EdgeGlow";
            edge.transform.SetParent(this.transform, false);
            edge.transform.localPosition = localPos;
            edge.transform.localScale = scale;

            Collider edgeCol = edge.GetComponent<Collider>();
            if (edgeCol != null) Destroy(edgeCol);

            Renderer r = edge.GetComponent<Renderer>();
            if (r != null)
            {
                Material m = new Material(Shader.Find("Standard"));
                m.color = edgeColor;
                m.EnableKeyword("_EMISSION");
                m.SetColor("_EmissionColor", edgeColor * 1.5f);
                r.material = m;
            }
        }

        private void CreateBudgetBadge(Vector3 localPos)
        {
            GameObject badge = new GameObject("BudgetMarkerLabel");
            badge.transform.SetParent(this.transform, false);
            badge.transform.localPosition = localPos;

            TextMeshPro text = badge.AddComponent<TextMeshPro>();
            text.text = $"<color=#FF4455>⚠ BUDGET LIMIT: ₹{budgetAmountRupees:N0} (Y=3.0m)</color>";
            text.fontSize = 3.2f;
            text.alignment = TextAlignmentOptions.Center;
            badge.AddComponent<BillboardLookAtCamera>();
        }

        private void Update()
        {
            // Subtle breathing luminescence for futuristic holographic effect
            if (runtimePlaneMaterial != null)
            {
                float pulse = 0.28f + 0.08f * Mathf.Sin(Time.time * 2.2f);
                Color c = planeColor;
                c.a = pulse;
                runtimePlaneMaterial.color = c;
            }
        }
    }
}
