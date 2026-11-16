using System;
using UnityEngine;

namespace ISDOnline.Financial
{
    /// <summary>
    /// Implements interactive raycasting, hover highlights, selection effects,
    /// and spatial detail modal binding for a 3D expense pillar.
    /// Compatible with Desktop Mouse, Mobile Touch, VR Gaze Reticle, and XR Controllers.
    /// </summary>
    [RequireComponent(typeof(Collider))]
    public class PillarInteraction : MonoBehaviour
    {
        [Header("Highlight Settings")]
        [SerializeField] private Color defaultEmissionColor;
        [SerializeField] private Color highlightEmissionColor = new Color(1.0f, 0.82f, 0.15f, 1f); // Gold highlight
        [SerializeField] private Material highlightMaterial;

        private CategoryFinancialData categoryData;
        private GameObject geometryObject;
        private Renderer pillarRenderer;
        private Material originalMaterial;
        private Material runtimeHighlightMat;

        private bool isHovered = false;
        private bool isSelected = false;
        private bool isOverBudget = false;

        // VR Gaze timer support
        private float gazeTimer = 0f;
        private const float GAZE_TRIGGER_DURATION = 1.5f;

        public CategoryFinancialData CategoryData => categoryData;
        public bool IsSelected => isSelected;

        public void Initialize(CategoryFinancialData data, GameObject geometry, bool overBudget, Material customHighlightMat = null)
        {
            categoryData = data;
            geometryObject = geometry;
            isOverBudget = overBudget;

            if (geometryObject != null)
            {
                pillarRenderer = geometryObject.GetComponent<Renderer>();
                if (pillarRenderer != null)
                {
                    originalMaterial = pillarRenderer.material;
                    if (originalMaterial.HasProperty("_EmissionColor"))
                    {
                        defaultEmissionColor = originalMaterial.GetColor("_EmissionColor");
                    }
                }
            }

            if (customHighlightMat != null)
            {
                highlightMaterial = customHighlightMat;
            }
        }

        #region Unity Mouse Interaction (Desktop)

        private void OnMouseEnter()
        {
            SetHover(true);
        }

        private void OnMouseExit()
        {
            SetHover(false);
        }

        private void OnMouseDown()
        {
            SelectPillar();
        }

        #endregion

        #region Universal Raycast & VR Interaction

        /// <summary>
        /// Called by VR controller raycasters or gaze reticle pointers when hovering over this pillar.
        /// </summary>
        public void OnRaycastHover(bool hovering)
        {
            SetHover(hovering);
        }

        /// <summary>
        /// Called by VR controllers or touch inputs when clicking/triggering this pillar.
        /// </summary>
        public void OnRaycastSelect()
        {
            SelectPillar();
        }

        /// <summary>
        /// VR Gaze dwell timer trigger: auto-selects if user gazes at the pillar for 1.5 seconds.
        /// </summary>
        public void OnGazeStay(float deltaTime)
        {
            if (!isHovered) SetHover(true);

            gazeTimer += deltaTime;
            if (gazeTimer >= GAZE_TRIGGER_DURATION)
            {
                gazeTimer = 0f;
                SelectPillar();
            }
        }

        public void OnGazeExit()
        {
            gazeTimer = 0f;
            SetHover(false);
        }

        #endregion

        public void SetHover(bool hover)
        {
            if (isHovered == hover) return;
            isHovered = hover;

            if (pillarRenderer != null && originalMaterial != null)
            {
                if (isHovered)
                {
                    // Apply glowing gold highlight
                    pillarRenderer.material.EnableKeyword("_EMISSION");
                    pillarRenderer.material.SetColor("_EmissionColor", highlightEmissionColor * 1.8f);
                }
                else if (!isSelected)
                {
                    // Revert to original emission
                    pillarRenderer.material.SetColor("_EmissionColor", defaultEmissionColor);
                }
            }
        }

        public void SelectPillar()
        {
            isSelected = true;

            // Trigger spatial 3D Transaction HUD
            if (TransactionHUD.Instance != null && categoryData != null)
            {
                Vector3 hudPosition = transform.position + new Vector3(0f, 2.2f, -1.2f);
                TransactionHUD.Instance.ShowCategoryDetails(categoryData, hudPosition, this);
            }
            else
            {
                Debug.Log($"[PillarInteraction] Selected: {categoryData?.categoryName} (₹{categoryData?.totalSpentRupees:N0})");
            }
        }

        public void Deselect()
        {
            isSelected = false;
            if (pillarRenderer != null && originalMaterial != null)
            {
                pillarRenderer.material.SetColor("_EmissionColor", defaultEmissionColor);
            }
        }
    }
}
