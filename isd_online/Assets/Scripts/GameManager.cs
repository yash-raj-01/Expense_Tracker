using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// Central game manager: handles scoring, UI updates, victory conditions, and level restart.
/// </summary>
public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    [Header("UI References")]
    [Tooltip("Text displaying current coins collected")]
    public TextMeshProUGUI coinsText;

    [Tooltip("Text displaying total score")]
    public TextMeshProUGUI scoreText;

    [Tooltip("Victory modal panel popup")]
    public GameObject victoryPanel;

    [Tooltip("Victory text displaying final score")]
    public TextMeshProUGUI victoryScoreText;

    [Tooltip("Restart button on victory screen")]
    public Button restartButton;

    [Header("Game State")]
    public int coinsCollected = 0;
    public int totalCoins = 0;
    public int currentScore = 0;
    public bool isVictory = false;

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;
    }

    private void Start()
    {
        // Count total coins in scene
        Coin[] coins = Object.FindObjectsByType<Coin>(FindObjectsSortMode.None);
        totalCoins = coins.Length;

        // Hide victory panel on start
        if (victoryPanel != null)
        {
            victoryPanel.SetActive(false);
        }

        // Setup restart button listener
        if (restartButton != null)
        {
            restartButton.onClick.AddListener(RestartGame);
        }

        UpdateUI();
    }

    private void Update()
    {
        // Shortcut key: R to restart anytime or after victory
        if (Input.GetKeyDown(KeyCode.R))
        {
            RestartGame();
        }
    }

    /// <summary>
    /// Called when a coin is collected by the player.
    /// </summary>
    public void CollectCoin(int points)
    {
        coinsCollected++;
        currentScore += points;
        UpdateUI();
    }

    /// <summary>
    /// Updates HUD labels with current coins and score.
    /// </summary>
    private void UpdateUI()
    {
        if (coinsText != null)
        {
            coinsText.text = $"🪙 Coins: {coinsCollected} / {totalCoins}";
        }

        if (scoreText != null)
        {
            scoreText.text = $"⭐ Score: {currentScore}";
        }
    }

    /// <summary>
    /// Displays victory screen when player reaches the treasure chest.
    /// </summary>
    public void WinGame()
    {
        if (isVictory) return;
        isVictory = true;

        if (victoryPanel != null)
        {
            victoryPanel.SetActive(true);
        }

        if (victoryScoreText != null)
        {
            victoryScoreText.text = $"Final Score: {currentScore} Points\nCoins Collected: {coinsCollected}/{totalCoins}";
        }

        PlayVictoryFanfare();
    }

    /// <summary>
    /// Reloads the active scene to restart the game.
    /// </summary>
    public void RestartGame()
    {
        SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
    }

    /// <summary>
    /// Generates a celebratory ascending procedural victory chime fanfare.
    /// </summary>
    private void PlayVictoryFanfare()
    {
        GameObject audioObj = new GameObject("VictoryAudio");
        AudioSource audioSource = audioObj.AddComponent<AudioSource>();

        int sampleRate = 44100;
        float duration = 0.8f;
        int sampleCount = (int)(sampleRate * duration);
        float[] samples = new float[sampleCount];

        // Ascending triumphant notes: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
        float[] freqs = { 523.25f, 659.25f, 783.99f, 1046.50f };
        float noteDuration = duration / freqs.Length;

        for (int i = 0; i < sampleCount; i++)
        {
            float t = (float)i / sampleRate;
            int noteIndex = Mathf.Clamp((int)(t / noteDuration), 0, freqs.Length - 1);
            float freq = freqs[noteIndex];
            float noteT = t - (noteIndex * noteDuration);
            float noteEnv = Mathf.Clamp01(1.0f - (noteT / noteDuration) * 0.7f);
            samples[i] = Mathf.Sin(2 * Mathf.PI * freq * t) * noteEnv * 0.4f;
        }

        AudioClip clip = AudioClip.Create("VictoryFanfare", sampleCount, 1, sampleRate, false);
        clip.SetData(samples, 0);

        audioSource.clip = clip;
        audioSource.volume = 0.6f;
        audioSource.spatialBlend = 0.0f;
        audioSource.Play();

        Destroy(audioObj, duration + 0.2f);
    }
}
