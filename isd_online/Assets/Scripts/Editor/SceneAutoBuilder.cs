#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace ISDOnline.Financial.Editor
{
    /// <summary>
    /// Editor automation tool that constructs and configures the complete 3D Financial Room scene.
    /// Accessible via menu item: "Expense Tracker/Build Financial Room Scene".
    /// </summary>
    public static class SceneAutoBuilder
    {
        private const string SCENE_PATH = "Assets/Scenes/MainFinancialRoom.unity";

        [MenuItem("Expense Tracker/Build Financial Room Scene", false, 10)]
        public static void BuildScene()
        {
            // Create a fresh scene
            Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

            // 1. Environment & Ambient Lighting
            RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
            RenderSettings.ambientLight = new Color(0.06f, 0.09f, 0.15f); // Deep navy ambient tone
            RenderSettings.fog = true;
            RenderSettings.fogMode = FogMode.ExponentialSquared;
            RenderSettings.fogColor = new Color(0.03f, 0.05f, 0.09f);
            RenderSettings.fogDensity = 0.012f;

            // 2. Lighting Rig
            // Key Directional Light
            GameObject keyLightObj = new GameObject("KeyDirectionalLight");
            Light keyLight = keyLightObj.AddComponent<Light>();
            keyLight.type = LightType.Directional;
            keyLight.color = new Color(0.95f, 0.98f, 1.0f);
            keyLight.intensity = 1.15f;
            keyLight.shadows = LightShadows.Soft;
            keyLightObj.transform.rotation = Quaternion.Euler(45f, -30f, 0f);

            // Accent Cyan Rim Light
            GameObject accentLightObj = new GameObject("AccentRimLight");
            Light accentLight = accentLightObj.AddComponent<Light>();
            accentLight.type = LightType.Directional;
            accentLight.color = new Color(0.0f, 0.75f, 0.95f);
            accentLight.intensity = 0.45f;
            accentLight.shadows = LightShadows.None;
            accentLightObj.transform.rotation = Quaternion.Euler(135f, 60f, 0f);

            // 3. Dark Matte Grid Floor
            GameObject floor = GameObject.CreatePrimitive(PrimitiveType.Plane);
            floor.name = "FloorGrid";
            floor.transform.position = Vector3.zero;
            floor.transform.localScale = new Vector3(4f, 1f, 4f); // 40m x 40m floor
            Renderer floorR = floor.GetComponent<Renderer>();
            Material floorMat = AssetDatabase.LoadAssetAtPath<Material>("Assets/Materials/FloorGridMat.mat");
            if (floorMat != null)
            {
                floorR.sharedMaterial = floorMat;
            }

            // 4. Main Camera Rig
            GameObject camRig = new GameObject("CameraRig");
            camRig.transform.position = new Vector3(0f, 2.5f, -7.0f);
            camRig.transform.rotation = Quaternion.Euler(14f, 0f, 0f);

            Camera mainCam = camRig.AddComponent<Camera>();
            mainCam.tag = "MainCamera";
            mainCam.clearFlags = CameraClearFlags.SolidColor;
            mainCam.backgroundColor = new Color(0.03f, 0.05f, 0.08f);
            mainCam.fieldOfView = 65f;
            mainCam.nearClipPlane = 0.1f;
            mainCam.farClipPlane = 100f;

            camRig.AddComponent<AudioListener>();
            camRig.AddComponent<CameraController>();
            camRig.AddComponent<XRDeviceController>();

            // 5. Backend API Service
            GameObject apiObj = new GameObject("ExpenseApiService");
            apiObj.AddComponent<ExpenseApiService>();

            // 6. 3D Expense Visualizer
            GameObject visualizerObj = new GameObject("ExpenseVisualizer");
            ExpenseVisualizer visualizer = visualizerObj.AddComponent<ExpenseVisualizer>();

            // 7. Budget Threshold Plane at Y = 3.0
            GameObject budgetObj = new GameObject("BudgetPlane");
            budgetObj.transform.position = new Vector3(0f, 3.0f, 0f);
            budgetObj.AddComponent<BudgetPlaneVisualizer>();

            // 8. AI Advisor Orb & 3D Info Board
            GameObject orbObj = new GameObject("AIAdvisorOrb");
            orbObj.transform.position = new Vector3(-4.6f, 2.6f, 0.5f);
            orbObj.AddComponent<AIAdvisorOrb>();

            // 9. Floating 3D Transaction HUD
            GameObject hudObj = new GameObject("TransactionHUD");
            hudObj.AddComponent<TransactionHUD>();

            // Save the newly constructed scene
            EditorSceneManager.SaveScene(scene, SCENE_PATH);
            Debug.Log($"[SceneAutoBuilder] Successfully generated and saved Financial Room scene at: {SCENE_PATH}");
        }
    }
}
#endif
