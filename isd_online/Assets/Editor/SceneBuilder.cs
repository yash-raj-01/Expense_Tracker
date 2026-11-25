using System.IO;
using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using TMPro;

/// <summary>
/// Editor utility that procedurally constructs the entire "Ledger 3D - Coin Collector" game:
/// materials, platforms, obstacles, treasure chest, coins, player, follow camera, lighting, and TMP UI.
/// </summary>
public static class SceneBuilder
{
    private static Material matGrass;
    private static Material matPlatformBase;
    private static Material matGoldCoin;
    private static Material matObstacle;
    private static Material matTreasureWood;
    private static Material matTreasureGold;
    private static Material matPlayer;
    private static Material matPlayerVisor;
    private static Material matTreeLeaves;
    private static Material matTreeTrunk;
    private static Material matWater;

    [MenuItem("Ledger 3D/Build Complete Game Scene")]
    public static void Build()
    {
        Debug.Log("[SceneBuilder] Starting build of Ledger 3D - Coin Collector...");

        EnsureDirectories();
        CreateMaterials();

        // Create new empty scene
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

        // Build Scene Hierarchy
        GameObject rootEnv = new GameObject("Environment");
        GameObject rootCoins = new GameObject("Coins");
        GameObject rootObstacles = new GameObject("Obstacles");

        BuildPlatforms(rootEnv);
        BuildObstacles(rootObstacles);
        GameObject chestObj = BuildTreasureChest(rootEnv);
        BuildDecorations(rootEnv);
        BuildCoins(rootCoins);
        BuildVoidFloor(rootEnv);

        // Lighting & Sky
        SetupLighting();

        // Player & Camera
        GameObject playerObj = BuildPlayer();
        BuildCamera(playerObj.transform);

        // UI Canvas & GameManager
        BuildUIAndGameManager(playerObj, chestObj);

        // Create Prefabs
        CreatePrefabs(playerObj, chestObj);

        // Save Scene
        string scenePath = "Assets/Scenes/MainScene.unity";
        EditorSceneManager.SaveScene(scene, scenePath);
        Debug.Log($"[SceneBuilder] Scene successfully saved to {scenePath}");

        // Update Build Settings
        EditorBuildSettingsScene[] buildScenes = new EditorBuildSettingsScene[]
        {
            new EditorBuildSettingsScene(scenePath, true)
        };
        EditorBuildSettings.scenes = buildScenes;
        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();

        Debug.Log("[SceneBuilder] BUILD COMPLETE! Ledger 3D - Coin Collector is ready to play!");
    }

    private static void EnsureDirectories()
    {
        string[] dirs = { "Assets/Scenes", "Assets/Materials", "Assets/Prefabs", "Assets/Scripts" };
        foreach (string d in dirs)
        {
            if (!Directory.Exists(d)) Directory.CreateDirectory(d);
        }
    }

    private static void CreateMaterials()
    {
        Shader standardShader = Shader.Find("Universal Render Pipeline/Lit") ??
                                Shader.Find("Standard") ??
                                Shader.Find("Mobile/Diffuse");

        matGrass = GetOrCreateMaterial("Mat_Grass", new Color(0.24f, 0.65f, 0.38f), 0.0f, 0.2f, standardShader);
        matPlatformBase = GetOrCreateMaterial("Mat_Platform_Base", new Color(0.22f, 0.26f, 0.32f), 0.0f, 0.3f, standardShader);
        matGoldCoin = GetOrCreateMaterial("Mat_Gold_Coin", new Color(0.96f, 0.82f, 0.24f), 0.95f, 0.85f, standardShader);
        if (matGoldCoin.HasProperty("_EmissionColor"))
        {
            matGoldCoin.EnableKeyword("_EMISSION");
            matGoldCoin.SetColor("_EmissionColor", new Color(0.35f, 0.28f, 0.05f));
        }

        matObstacle = GetOrCreateMaterial("Mat_Obstacle", new Color(0.88f, 0.22f, 0.22f), 0.1f, 0.4f, standardShader);
        matTreasureWood = GetOrCreateMaterial("Mat_Treasure_Wood", new Color(0.44f, 0.24f, 0.14f), 0.0f, 0.25f, standardShader);
        matTreasureGold = GetOrCreateMaterial("Mat_Treasure_Gold", new Color(0.98f, 0.85f, 0.20f), 0.9f, 0.9f, standardShader);
        matPlayer = GetOrCreateMaterial("Mat_Player", new Color(0.18f, 0.52f, 0.85f), 0.1f, 0.6f, standardShader);
        matPlayerVisor = GetOrCreateMaterial("Mat_Player_Visor", new Color(0.98f, 0.98f, 1.0f), 0.2f, 0.95f, standardShader);
        matTreeLeaves = GetOrCreateMaterial("Mat_Tree_Leaves", new Color(0.15f, 0.46f, 0.26f), 0.0f, 0.2f, standardShader);
        matTreeTrunk = GetOrCreateMaterial("Mat_Tree_Trunk", new Color(0.35f, 0.22f, 0.12f), 0.0f, 0.2f, standardShader);
        matWater = GetOrCreateMaterial("Mat_Water_Void", new Color(0.16f, 0.48f, 0.55f), 0.4f, 0.9f, standardShader);

        AssetDatabase.SaveAssets();
    }

    private static Material GetOrCreateMaterial(string name, Color color, float metallic, float smoothness, Shader shader)
    {
        string path = $"Assets/Materials/{name}.mat";
        Material mat = AssetDatabase.LoadAssetAtPath<Material>(path);
        if (mat == null)
        {
            mat = new Material(shader);
            AssetDatabase.CreateAsset(mat, path);
        }
        mat.color = color;
        if (mat.HasProperty("_BaseColor")) mat.SetColor("_BaseColor", color);
        if (mat.HasProperty("_Metallic")) mat.SetFloat("_Metallic", metallic);
        if (mat.HasProperty("_Smoothness")) mat.SetFloat("_Smoothness", smoothness);
        if (mat.HasProperty("_Glossiness")) mat.SetFloat("_Glossiness", smoothness);
        EditorUtility.SetDirty(mat);
        return mat;
    }

    private static void BuildPlatforms(GameObject parent)
    {
        // 1. Starting Haven Platform (Pos: 0, 0, 0, Size: 10 x 1.2 x 10)
        CreatePlatform("Platform_Start", new Vector3(0f, 0f, 0f), new Vector3(10f, 1.2f, 10f), parent);

        // 2. Stepping Stones across the chasm
        CreatePlatform("Step_1", new Vector3(0f, 0.6f, 8f), new Vector3(3.2f, 1.0f, 3.2f), parent);
        CreatePlatform("Step_2", new Vector3(3.5f, 1.4f, 12f), new Vector3(3.0f, 1.0f, 3.0f), parent);
        CreatePlatform("Step_3", new Vector3(-3.2f, 2.2f, 16f), new Vector3(3.0f, 1.0f, 3.0f), parent);

        // 3. The Ledger Ridge Platform (Pos: 0, 3.2, 22, Size: 14 x 1.2 x 6)
        CreatePlatform("Platform_Ridge", new Vector3(0f, 3.2f, 22f), new Vector3(14f, 1.2f, 6f), parent);

        // 4. Ascent Stairway Steps
        CreatePlatform("Step_4", new Vector3(3.5f, 4.4f, 27f), new Vector3(3.2f, 1.0f, 3.2f), parent);
        CreatePlatform("Step_5", new Vector3(1.0f, 5.6f, 31f), new Vector3(3.2f, 1.0f, 3.2f), parent);

        // 5. Summit Sanctuary Platform (Pos: 0, 6.8, 36, Size: 9 x 1.2 x 9)
        CreatePlatform("Platform_Summit", new Vector3(0f, 6.8f, 36f), new Vector3(9f, 1.2f, 9f), parent);
    }

    private static void CreatePlatform(string name, Vector3 pos, Vector3 size, GameObject parent)
    {
        GameObject plat = new GameObject(name);
        plat.transform.parent = parent.transform;
        plat.transform.position = pos;

        // Base Stone/Earth Slab
        GameObject baseSlab = GameObject.CreatePrimitive(PrimitiveType.Cube);
        baseSlab.name = "StoneBase";
        baseSlab.transform.parent = plat.transform;
        baseSlab.transform.localPosition = Vector3.zero;
        baseSlab.transform.localScale = size;
        baseSlab.GetComponent<Renderer>().sharedMaterial = matPlatformBase;

        // Lush Grass Top Layer
        GameObject grassTop = GameObject.CreatePrimitive(PrimitiveType.Cube);
        grassTop.name = "GrassTop";
        grassTop.transform.parent = plat.transform;
        grassTop.transform.localPosition = new Vector3(0f, (size.y * 0.5f) + 0.05f, 0f);
        grassTop.transform.localScale = new Vector3(size.x + 0.1f, 0.15f, size.z + 0.1f);
        grassTop.GetComponent<Renderer>().sharedMaterial = matGrass;
        // Disable top collider to prevent duplicate physics events
        Object.DestroyImmediate(grassTop.GetComponent<Collider>());
    }

    private static void BuildObstacles(GameObject parent)
    {
        // Obstacles placed on Platform_Ridge (Pos: 0, 3.2, 22)
        CreateObstaclePillar("Hazard_Pillar_Left", new Vector3(-3.0f, 4.4f, 22f), new Vector3(1.2f, 1.6f, 1.2f), parent);
        CreateObstaclePillar("Hazard_Pillar_Right", new Vector3(3.0f, 4.4f, 22f), new Vector3(1.2f, 1.6f, 1.2f), parent);

        // Low jump hurdle in the center of the ridge
        CreateObstaclePillar("Hazard_Hurdle_Center", new Vector3(0f, 4.1f, 22f), new Vector3(2.5f, 0.6f, 0.8f), parent);
    }

    private static void CreateObstaclePillar(string name, Vector3 pos, Vector3 size, GameObject parent)
    {
        GameObject pillar = GameObject.CreatePrimitive(PrimitiveType.Cube);
        pillar.name = name;
        pillar.transform.parent = parent.transform;
        pillar.transform.position = pos;
        pillar.transform.localScale = size;
        pillar.GetComponent<Renderer>().sharedMaterial = matObstacle;
    }

    private static GameObject BuildTreasureChest(GameObject parent)
    {
        GameObject chest = new GameObject("TreasureChest");
        chest.tag = "Treasure";
        chest.transform.parent = parent.transform;
        chest.transform.position = new Vector3(0f, 7.8f, 38f);

        // Chest Body (Wood Cube)
        GameObject body = GameObject.CreatePrimitive(PrimitiveType.Cube);
        body.name = "ChestBody";
        body.transform.parent = chest.transform;
        body.transform.localPosition = new Vector3(0f, 0.4f, 0f);
        body.transform.localScale = new Vector3(1.6f, 0.8f, 1.1f);
        body.GetComponent<Renderer>().sharedMaterial = matTreasureWood;

        // Chest Lid (Wood Cube rounded slightly)
        GameObject lid = GameObject.CreatePrimitive(PrimitiveType.Cube);
        lid.name = "ChestLid";
        lid.transform.parent = chest.transform;
        lid.transform.localPosition = new Vector3(0f, 0.95f, 0f);
        lid.transform.localScale = new Vector3(1.65f, 0.35f, 1.15f);
        lid.GetComponent<Renderer>().sharedMaterial = matTreasureWood;

        // Gold Trim Bands
        GameObject trimLeft = GameObject.CreatePrimitive(PrimitiveType.Cube);
        trimLeft.name = "TrimLeft";
        trimLeft.transform.parent = chest.transform;
        trimLeft.transform.localPosition = new Vector3(-0.55f, 0.55f, 0f);
        trimLeft.transform.localScale = new Vector3(0.12f, 1.1f, 1.2f);
        trimLeft.GetComponent<Renderer>().sharedMaterial = matTreasureGold;
        Object.DestroyImmediate(trimLeft.GetComponent<Collider>());

        GameObject trimRight = GameObject.CreatePrimitive(PrimitiveType.Cube);
        trimRight.name = "TrimRight";
        trimRight.transform.parent = chest.transform;
        trimRight.transform.localPosition = new Vector3(0.55f, 0.55f, 0f);
        trimRight.transform.localScale = new Vector3(0.12f, 1.1f, 1.2f);
        trimRight.GetComponent<Renderer>().sharedMaterial = matTreasureGold;
        Object.DestroyImmediate(trimRight.GetComponent<Collider>());

        // Gold Lock
        GameObject lockObj = GameObject.CreatePrimitive(PrimitiveType.Cube);
        lockObj.name = "GoldLock";
        lockObj.transform.parent = chest.transform;
        lockObj.transform.localPosition = new Vector3(0f, 0.65f, -0.6f);
        lockObj.transform.localScale = new Vector3(0.25f, 0.3f, 0.15f);
        lockObj.GetComponent<Renderer>().sharedMaterial = matTreasureGold;
        Object.DestroyImmediate(lockObj.GetComponent<Collider>());

        // Trigger Collider covering the chest area
        BoxCollider boxCol = chest.AddComponent<BoxCollider>();
        boxCol.isTrigger = true;
        boxCol.center = new Vector3(0f, 0.8f, 0f);
        boxCol.size = new Vector3(2.6f, 2.0f, 2.6f);

        return chest;
    }

    private static void BuildDecorations(GameObject parent)
    {
        // Add Low-Poly Pine Trees on Start Platform
        CreateLowPolyTree(new Vector3(-3.5f, 0.6f, -3.2f), parent);
        CreateLowPolyTree(new Vector3(3.5f, 0.6f, -3.2f), parent);
        CreateLowPolyTree(new Vector3(-3.8f, 0.6f, 2.8f), parent);

        // Corner Pillars on Summit Platform
        CreateSummitPillar(new Vector3(-3.8f, 7.4f, 32.5f), parent);
        CreateSummitPillar(new Vector3(3.8f, 7.4f, 32.5f), parent);
        CreateSummitPillar(new Vector3(-3.8f, 7.4f, 39.5f), parent);
        CreateSummitPillar(new Vector3(3.8f, 7.4f, 39.5f), parent);
    }

    private static void CreateLowPolyTree(Vector3 pos, GameObject parent)
    {
        GameObject tree = new GameObject("LowPolyTree");
        tree.transform.parent = parent.transform;
        tree.transform.position = pos;

        // Trunk
        GameObject trunk = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        trunk.name = "Trunk";
        trunk.transform.parent = tree.transform;
        trunk.transform.localPosition = new Vector3(0f, 0.7f, 0f);
        trunk.transform.localScale = new Vector3(0.35f, 0.7f, 0.35f);
        trunk.GetComponent<Renderer>().sharedMaterial = matTreeTrunk;

        // Foliage Layers (using stretched spheres/cubes for low-poly stylized look)
        GameObject foliage1 = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        foliage1.name = "FoliageBottom";
        foliage1.transform.parent = tree.transform;
        foliage1.transform.localPosition = new Vector3(0f, 1.7f, 0f);
        foliage1.transform.localScale = new Vector3(1.6f, 1.2f, 1.6f);
        foliage1.GetComponent<Renderer>().sharedMaterial = matTreeLeaves;

        GameObject foliage2 = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        foliage2.name = "FoliageTop";
        foliage2.transform.parent = tree.transform;
        foliage2.transform.localPosition = new Vector3(0f, 2.5f, 0f);
        foliage2.transform.localScale = new Vector3(1.1f, 1.0f, 1.1f);
        foliage2.GetComponent<Renderer>().sharedMaterial = matTreeLeaves;
    }

    private static void CreateSummitPillar(Vector3 pos, GameObject parent)
    {
        GameObject pillar = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        pillar.name = "SummitPillar";
        pillar.transform.parent = parent.transform;
        pillar.transform.position = pos;
        pillar.transform.localScale = new Vector3(0.5f, 1.2f, 0.5f);
        pillar.GetComponent<Renderer>().sharedMaterial = matPlatformBase;

        // Golden Cap
        GameObject cap = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        cap.name = "PillarCap";
        cap.transform.parent = pillar.transform;
        cap.transform.localPosition = new Vector3(0f, 1.0f, 0f);
        cap.transform.localScale = new Vector3(1.2f, 0.8f, 1.2f);
        cap.GetComponent<Renderer>().sharedMaterial = matTreasureGold;
    }

    private static void BuildCoins(GameObject parent)
    {
        Vector3[] coinPositions = new Vector3[]
        {
            new Vector3(0f, 1.5f, -1.0f),    // 1: Start Platform Center
            new Vector3(0f, 1.5f, 2.5f),     // 2: Start Platform Edge
            new Vector3(0f, 2.1f, 8.0f),     // 3: Stepping Stone 1
            new Vector3(3.5f, 2.9f, 12.0f),  // 4: Stepping Stone 2
            new Vector3(-3.2f, 3.7f, 16.0f), // 5: Stepping Stone 3
            new Vector3(-4.5f, 4.7f, 22.0f), // 6: Ridge Left Path
            new Vector3(0f, 5.2f, 22.0f),    // 7: Ridge Center (over hurdle)
            new Vector3(4.5f, 4.7f, 22.0f),  // 8: Ridge Right Path
            new Vector3(3.5f, 5.9f, 27.0f),  // 9: Ascent Step 1
            new Vector3(1.0f, 7.1f, 31.0f),  // 10: Ascent Step 2
            new Vector3(-2.0f, 8.3f, 36.0f), // 11: Summit Left
            new Vector3(2.0f, 8.3f, 36.0f)   // 12: Summit Right
        };

        for (int i = 0; i < coinPositions.Length; i++)
        {
            CreateCoinGameObject($"Coin_{i + 1}", coinPositions[i], parent);
        }
    }

    private static GameObject CreateCoinGameObject(string name, Vector3 pos, GameObject parent)
    {
        GameObject coinObj = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        coinObj.name = name;
        coinObj.tag = "Respawn"; // Or Untagged
        coinObj.transform.parent = parent.transform;
        coinObj.transform.position = pos;
        // Flatten into coin disc, tilted slightly for sparkling visual
        coinObj.transform.localScale = new Vector3(0.65f, 0.08f, 0.65f);
        coinObj.transform.rotation = Quaternion.Euler(60f, 0f, 0f);

        coinObj.GetComponent<Renderer>().sharedMaterial = matGoldCoin;

        // Set trigger collider
        Collider col = coinObj.GetComponent<Collider>();
        col.isTrigger = true;

        // Add Coin gameplay script
        Coin coinScript = coinObj.AddComponent<Coin>();
        coinScript.scoreValue = 100;
        coinScript.rotationSpeed = 140f;
        coinScript.bobFrequency = 3.2f;
        coinScript.bobAmplitude = 0.15f;

        return coinObj;
    }

    private static void BuildVoidFloor(GameObject parent)
    {
        // Aesthetic calm stylized water/void plane far below
        GameObject voidPlane = GameObject.CreatePrimitive(PrimitiveType.Plane);
        voidPlane.name = "VoidFloor";
        voidPlane.transform.parent = parent.transform;
        voidPlane.transform.position = new Vector3(0f, -12f, 20f);
        voidPlane.transform.localScale = new Vector3(25f, 1f, 25f);
        voidPlane.GetComponent<Renderer>().sharedMaterial = matWater;
        Object.DestroyImmediate(voidPlane.GetComponent<Collider>());
    }

    private static void SetupLighting()
    {
        // Directional Sunlight
        GameObject lightObj = new GameObject("Directional Light");
        Light lightComp = lightObj.AddComponent<Light>();
        lightComp.type = LightType.Directional;
        lightComp.color = new Color(1.0f, 0.96f, 0.88f);
        lightComp.intensity = 1.25f;
        lightComp.shadows = LightShadows.Soft;
        lightObj.transform.position = new Vector3(10f, 25f, -10f);
        lightObj.transform.rotation = Quaternion.Euler(50f, -35f, 0f);

        // Ambient Light
        RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
        RenderSettings.ambientLight = new Color(0.55f, 0.62f, 0.72f);
    }

    private static GameObject BuildPlayer()
    {
        GameObject player = GameObject.CreatePrimitive(PrimitiveType.Capsule);
        player.name = "Player";
        player.tag = "Player";
        player.transform.position = new Vector3(0f, 1.6f, -3.0f);
        player.transform.localScale = Vector3.one;

        player.GetComponent<Renderer>().sharedMaterial = matPlayer;

        // Visor / Face feature
        GameObject visor = GameObject.CreatePrimitive(PrimitiveType.Cube);
        visor.name = "Visor";
        visor.transform.parent = player.transform;
        visor.transform.localPosition = new Vector3(0f, 0.45f, 0.45f);
        visor.transform.localScale = new Vector3(0.45f, 0.25f, 0.25f);
        visor.GetComponent<Renderer>().sharedMaterial = matPlayerVisor;
        Object.DestroyImmediate(visor.GetComponent<Collider>());

        // Rigidbody
        Rigidbody rb = player.AddComponent<Rigidbody>();
        rb.mass = 1.0f;
        rb.freezeRotation = true;
        rb.collisionDetectionMode = CollisionDetectionMode.ContinuousDynamic;

        // PlayerController Script
        PlayerController pc = player.AddComponent<PlayerController>();
        pc.moveSpeed = 7.5f;
        pc.jumpForce = 7.5f;
        pc.rotationSpeed = 14.0f;
        pc.fallThreshold = -8.0f;

        return player;
    }

    private static void BuildCamera(Transform playerTransform)
    {
        GameObject camObj = new GameObject("Main Camera");
        camObj.tag = "MainCamera";
        Camera cam = camObj.AddComponent<Camera>();
        cam.clearFlags = CameraClearFlags.SolidColor;
        cam.backgroundColor = new Color(0.53f, 0.74f, 0.90f); // Bright stylized sky
        cam.fieldOfView = 60f;

        camObj.AddComponent<AudioListener>();

        camObj.transform.position = new Vector3(0f, 7.5f, -11.5f);
        camObj.transform.rotation = Quaternion.Euler(25f, 0f, 0f);

        // Follow Camera Script
        CameraController camControl = camObj.AddComponent<CameraController>();
        camControl.target = playerTransform;
        camControl.offset = new Vector3(0f, 5.8f, -8.2f);
        camControl.smoothSpeed = 6.0f;
        camControl.lookAtHeightOffset = 1.1f;
    }

    private static void BuildUIAndGameManager(GameObject playerObj, GameObject chestObj)
    {
        // EventSystem
        GameObject eventSystem = new GameObject("EventSystem");
        eventSystem.AddComponent<EventSystem>();
        eventSystem.AddComponent<StandaloneInputModule>();

        // Canvas
        GameObject canvasObj = new GameObject("Canvas");
        Canvas canvas = canvasObj.AddComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;

        CanvasScaler scaler = canvasObj.AddComponent<CanvasScaler>();
        scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        scaler.referenceResolution = new Vector2(1920, 1080);
        scaler.matchWidthOrHeight = 0.5f;

        canvasObj.AddComponent<GraphicRaycaster>();

        TMP_FontAsset defaultFont = TMP_Settings.defaultFontAsset;

        // --- 1. HUD Card (Top-Left) ---
        GameObject hudPanel = new GameObject("HUD_Card");
        hudPanel.transform.parent = canvasObj.transform;
        RectTransform hudRect = hudPanel.AddComponent<RectTransform>();
        hudRect.anchorMin = new Vector2(0f, 1f);
        hudRect.anchorMax = new Vector2(0f, 1f);
        hudRect.pivot = new Vector2(0f, 1f);
        hudRect.anchoredPosition = new Vector2(30f, -30f);
        hudRect.sizeDelta = new Vector2(320f, 140f);

        Image hudBg = hudPanel.AddComponent<Image>();
        hudBg.color = new Color(0.06f, 0.09f, 0.16f, 0.85f); // Sleek dark card

        // Game Title
        GameObject titleObj = new GameObject("TitleText");
        titleObj.transform.parent = hudPanel.transform;
        RectTransform titleRect = titleObj.AddComponent<RectTransform>();
        titleRect.anchorMin = new Vector2(0f, 1f);
        titleRect.anchorMax = new Vector2(1f, 1f);
        titleRect.pivot = new Vector2(0f, 1f);
        titleRect.anchoredPosition = new Vector2(18f, -12f);
        titleRect.sizeDelta = new Vector2(280f, 28f);
        TextMeshProUGUI titleText = titleObj.AddComponent<TextMeshProUGUI>();
        if (defaultFont != null) titleText.font = defaultFont;
        titleText.text = "LEDGER 3D";
        titleText.fontSize = 17f;
        titleText.fontStyle = FontStyles.Bold;
        titleText.color = new Color(0.38f, 0.76f, 0.98f); // Soft cyan

        // Coins Text
        GameObject coinsObj = new GameObject("CoinsText");
        coinsObj.transform.parent = hudPanel.transform;
        RectTransform coinsRect = coinsObj.AddComponent<RectTransform>();
        coinsRect.anchorMin = new Vector2(0f, 1f);
        coinsRect.anchorMax = new Vector2(1f, 1f);
        coinsRect.pivot = new Vector2(0f, 1f);
        coinsRect.anchoredPosition = new Vector2(18f, -44f);
        coinsRect.sizeDelta = new Vector2(280f, 34f);
        TextMeshProUGUI coinsText = coinsObj.AddComponent<TextMeshProUGUI>();
        if (defaultFont != null) coinsText.font = defaultFont;
        coinsText.text = "🪙 Coins: 0 / 12";
        coinsText.fontSize = 22f;
        coinsText.fontStyle = FontStyles.Bold;
        coinsText.color = new Color(1.0f, 0.88f, 0.25f); // Vibrant gold

        // Score Text
        GameObject scoreObj = new GameObject("ScoreText");
        scoreObj.transform.parent = hudPanel.transform;
        RectTransform scoreRect = scoreObj.AddComponent<RectTransform>();
        scoreRect.anchorMin = new Vector2(0f, 1f);
        scoreRect.anchorMax = new Vector2(1f, 1f);
        scoreRect.pivot = new Vector2(0f, 1f);
        scoreRect.anchoredPosition = new Vector2(18f, -80f);
        scoreRect.sizeDelta = new Vector2(280f, 32f);
        TextMeshProUGUI scoreText = scoreObj.AddComponent<TextMeshProUGUI>();
        if (defaultFont != null) scoreText.font = defaultFont;
        scoreText.text = "⭐ Score: 0";
        scoreText.fontSize = 20f;
        scoreText.color = Color.white;

        // Hint Text
        GameObject hintObj = new GameObject("ControlsHint");
        hintObj.transform.parent = hudPanel.transform;
        RectTransform hintRect = hintObj.AddComponent<RectTransform>();
        hintRect.anchorMin = new Vector2(0f, 0f);
        hintRect.anchorMax = new Vector2(1f, 0f);
        hintRect.pivot = new Vector2(0f, 0f);
        hintRect.anchoredPosition = new Vector2(18f, 8f);
        hintRect.sizeDelta = new Vector2(280f, 20f);
        TextMeshProUGUI hintText = hintObj.AddComponent<TextMeshProUGUI>();
        if (defaultFont != null) hintText.font = defaultFont;
        hintText.text = "WASD: Move  •  SPACE: Jump";
        hintText.fontSize = 13f;
        hintText.color = new Color(0.75f, 0.8f, 0.9f, 0.8f);

        // --- 2. Victory Modal Panel (Centered) ---
        GameObject victoryPanel = new GameObject("VictoryPanel");
        victoryPanel.transform.parent = canvasObj.transform;
        RectTransform vpRect = victoryPanel.AddComponent<RectTransform>();
        vpRect.anchorMin = Vector2.zero;
        vpRect.anchorMax = Vector2.one;
        vpRect.anchoredPosition = Vector2.zero;
        vpRect.sizeDelta = Vector2.zero;

        // Scrim background
        Image vpBg = victoryPanel.AddComponent<Image>();
        vpBg.color = new Color(0.05f, 0.08f, 0.15f, 0.82f);

        // Center Card
        GameObject cardObj = new GameObject("VictoryCard");
        cardObj.transform.parent = victoryPanel.transform;
        RectTransform cardRect = cardObj.AddComponent<RectTransform>();
        cardRect.anchorMin = new Vector2(0.5f, 0.5f);
        cardRect.anchorMax = new Vector2(0.5f, 0.5f);
        cardRect.pivot = new Vector2(0.5f, 0.5f);
        cardRect.anchoredPosition = Vector2.zero;
        cardRect.sizeDelta = new Vector2(560f, 400f);

        Image cardBg = cardObj.AddComponent<Image>();
        cardBg.color = new Color(0.10f, 0.15f, 0.24f, 0.98f);

        // Card Header
        GameObject vHeaderObj = new GameObject("VictoryHeader");
        vHeaderObj.transform.parent = cardObj.transform;
        RectTransform vHeaderRect = vHeaderObj.AddComponent<RectTransform>();
        vHeaderRect.anchorMin = new Vector2(0f, 1f);
        vHeaderRect.anchorMax = new Vector2(1f, 1f);
        vHeaderRect.pivot = new Vector2(0.5f, 1f);
        vHeaderRect.anchoredPosition = new Vector2(0f, -30f);
        vHeaderRect.sizeDelta = new Vector2(500f, 55f);
        TextMeshProUGUI vHeaderText = vHeaderObj.AddComponent<TextMeshProUGUI>();
        if (defaultFont != null) vHeaderText.font = defaultFont;
        vHeaderText.text = "🎉 VICTORY! 🎉";
        vHeaderText.fontSize = 42f;
        vHeaderText.fontStyle = FontStyles.Bold;
        vHeaderText.alignment = TextAlignmentOptions.Center;
        vHeaderText.color = new Color(1.0f, 0.85f, 0.25f);

        // Subtitle
        GameObject vSubObj = new GameObject("VictorySubtitle");
        vSubObj.transform.parent = cardObj.transform;
        RectTransform vSubRect = vSubObj.AddComponent<RectTransform>();
        vSubRect.anchorMin = new Vector2(0f, 1f);
        vSubRect.anchorMax = new Vector2(1f, 1f);
        vSubRect.pivot = new Vector2(0.5f, 1f);
        vSubRect.anchoredPosition = new Vector2(0f, -95f);
        vSubRect.sizeDelta = new Vector2(500f, 35f);
        TextMeshProUGUI vSubText = vSubObj.AddComponent<TextMeshProUGUI>();
        if (defaultFont != null) vSubText.font = defaultFont;
        vSubText.text = "Treasure Chest Reached & Vault Secured!";
        vSubText.fontSize = 20f;
        vSubText.alignment = TextAlignmentOptions.Center;
        vSubText.color = new Color(0.9f, 0.94f, 1.0f);

        // Score summary
        GameObject vScoreObj = new GameObject("VictoryScoreText");
        vScoreObj.transform.parent = cardObj.transform;
        RectTransform vScoreRect = vScoreObj.AddComponent<RectTransform>();
        vScoreRect.anchorMin = new Vector2(0f, 1f);
        vScoreRect.anchorMax = new Vector2(1f, 1f);
        vScoreRect.pivot = new Vector2(0.5f, 1f);
        vScoreRect.anchoredPosition = new Vector2(0f, -145f);
        vScoreRect.sizeDelta = new Vector2(500f, 80f);
        TextMeshProUGUI vScoreText = vScoreObj.AddComponent<TextMeshProUGUI>();
        if (defaultFont != null) vScoreText.font = defaultFont;
        vScoreText.text = "Final Score: 1200 Points\nCoins Collected: 12/12";
        vScoreText.fontSize = 24f;
        vScoreText.fontStyle = FontStyles.Bold;
        vScoreText.alignment = TextAlignmentOptions.Center;
        vScoreText.color = new Color(0.38f, 0.85f, 0.55f); // Vibrant light green

        // Restart Button
        GameObject restartBtnObj = new GameObject("RestartButton");
        restartBtnObj.transform.parent = cardObj.transform;
        RectTransform btnRect = restartBtnObj.AddComponent<RectTransform>();
        btnRect.anchorMin = new Vector2(0.5f, 0f);
        btnRect.anchorMax = new Vector2(0.5f, 0f);
        btnRect.pivot = new Vector2(0.5f, 0f);
        btnRect.anchoredPosition = new Vector2(0f, 40f);
        btnRect.sizeDelta = new Vector2(260f, 60f);

        Image btnImg = restartBtnObj.AddComponent<Image>();
        btnImg.color = new Color(0.20f, 0.65f, 0.40f); // Button green

        Button restartButton = restartBtnObj.AddComponent<Button>();
        ColorBlock cb = restartButton.colors;
        cb.highlightedColor = new Color(0.26f, 0.78f, 0.48f);
        cb.pressedColor = new Color(0.15f, 0.50f, 0.30f);
        restartButton.colors = cb;

        // Button label
        GameObject btnLabelObj = new GameObject("ButtonLabel");
        btnLabelObj.transform.parent = restartBtnObj.transform;
        RectTransform labelRect = btnLabelObj.AddComponent<RectTransform>();
        labelRect.anchorMin = Vector2.zero;
        labelRect.anchorMax = Vector2.one;
        labelRect.sizeDelta = Vector2.zero;
        labelRect.anchoredPosition = Vector2.zero;
        TextMeshProUGUI btnLabel = btnLabelObj.AddComponent<TextMeshProUGUI>();
        if (defaultFont != null) btnLabel.font = defaultFont;
        btnLabel.text = "PLAY AGAIN (R)";
        btnLabel.fontSize = 20f;
        btnLabel.fontStyle = FontStyles.Bold;
        btnLabel.alignment = TextAlignmentOptions.Center;
        btnLabel.color = Color.white;

        // --- 3. GameManager GameObject ---
        GameObject gmObj = new GameObject("GameManager");
        GameManager gm = gmObj.AddComponent<GameManager>();
        gm.coinsText = coinsText;
        gm.scoreText = scoreText;
        gm.victoryPanel = victoryPanel;
        gm.victoryScoreText = vScoreText;
        gm.restartButton = restartButton;

        // Hide victory panel by default
        victoryPanel.SetActive(false);
    }

    private static void CreatePrefabs(GameObject playerObj, GameObject chestObj)
    {
        // Player Prefab
        PrefabUtility.SaveAsPrefabAsset(playerObj, "Assets/Prefabs/Player.prefab");

        // TreasureChest Prefab
        PrefabUtility.SaveAsPrefabAsset(chestObj, "Assets/Prefabs/TreasureChest.prefab");

        // Coin Prefab from one of the coins
        GameObject sampleCoin = GameObject.Find("Coin_1");
        if (sampleCoin != null)
        {
            PrefabUtility.SaveAsPrefabAsset(sampleCoin, "Assets/Prefabs/Coin.prefab");
        }
    }
}
