using UnityEngine;

/// <summary>
/// Rotates and bobs a collectible gold coin.
/// Awards points, plays a pickup sound, and notifies GameManager when collected.
/// </summary>
[RequireComponent(typeof(Collider))]
public class Coin : MonoBehaviour
{
    [Header("Animation")]
    [Tooltip("Degrees per second around vertical axis")]
    public float rotationSpeed = 120.0f;

    [Tooltip("Up-and-down bobbing frequency")]
    public float bobFrequency = 3.0f;

    [Tooltip("Up-and-down bobbing height")]
    public float bobAmplitude = 0.15f;

    [Header("Collectible Settings")]
    [Tooltip("Score awarded upon collection")]
    public int scoreValue = 100;

    private Vector3 basePosition;
    private bool isCollected = false;

    private void Start()
    {
        basePosition = transform.position;

        // Ensure collider is set to trigger
        Collider col = GetComponent<Collider>();
        if (col != null)
        {
            col.isTrigger = true;
        }
    }

    private void Update()
    {
        // Smooth continuous spin
        transform.Rotate(Vector3.up, rotationSpeed * Time.deltaTime, Space.World);

        // Gentle sinusoidal bobbing
        float yOffset = Mathf.Sin(Time.time * bobFrequency) * bobAmplitude;
        transform.position = new Vector3(basePosition.x, basePosition.y + yOffset, basePosition.z);
    }

    private void OnTriggerEnter(Collider other)
    {
        if (isCollected) return;

        if (other.CompareTag("Player") || other.GetComponent<PlayerController>() != null)
        {
            isCollected = true;

            // Notify GameManager
            if (GameManager.Instance != null)
            {
                GameManager.Instance.CollectCoin(scoreValue);
            }

            // Play pickup sound chime
            PlayPickupChime();

            // Destroy coin
            Destroy(gameObject);
        }
    }

    /// <summary>
    /// Generates a pleasant procedural audio chime upon coin pickup without needing external audio files.
    /// </summary>
    private void PlayPickupChime()
    {
        GameObject audioObj = new GameObject("CoinChimeAudio");
        audioObj.transform.position = transform.position;
        AudioSource audioSource = audioObj.AddComponent<AudioSource>();

        int sampleRate = 44100;
        float duration = 0.25f;
        int sampleCount = (int)(sampleRate * duration);
        float[] samples = new float[sampleCount];

        // Synthesize a crisp 880Hz -> 1320Hz arpeggiated coin chime
        for (int i = 0; i < sampleCount; i++)
        {
            float t = (float)i / sampleRate;
            float freq = (t < 0.12f) ? 880.0f : 1320.0f;
            float envelope = 1.0f - (t / duration); // Decay
            samples[i] = Mathf.Sin(2 * Mathf.PI * freq * t) * envelope * 0.4f;
        }

        AudioClip clip = AudioClip.Create("CoinChime", sampleCount, 1, sampleRate, false);
        clip.SetData(samples, 0);

        audioSource.clip = clip;
        audioSource.volume = 0.5f;
        audioSource.spatialBlend = 0.0f; // 2D sound
        audioSource.Play();

        Destroy(audioObj, duration + 0.1f);
    }
}
