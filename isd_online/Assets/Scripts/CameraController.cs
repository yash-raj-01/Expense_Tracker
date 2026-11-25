using UnityEngine;

/// <summary>
/// Smooth third-person follow camera tracking the player character with configurable offset and damping.
/// </summary>
public class CameraController : MonoBehaviour
{
    [Header("Target")]
    [Tooltip("Transform of the player to follow")]
    public Transform target;

    [Header("Follow Settings")]
    [Tooltip("Offset position relative to the target")]
    public Vector3 offset = new Vector3(0f, 6.0f, -8.5f);

    [Tooltip("Smooth follow lag factor")]
    public float smoothSpeed = 6.0f;

    [Tooltip("Look-at height offset above player base")]
    public float lookAtHeightOffset = 1.2f;

    private void Start()
    {
        // Auto-find player by tag or name if not manually linked
        if (target == null)
        {
            GameObject player = GameObject.FindWithTag("Player");
            if (player == null)
            {
                PlayerController pc = Object.FindAnyObjectByType<PlayerController>();
                if (pc != null) player = pc.gameObject;
            }
            if (player != null)
            {
                target = player.transform;
            }
        }
    }

    private void LateUpdate()
    {
        if (target == null) return;

        // Desired camera position
        Vector3 desiredPosition = target.position + offset;

        // Smooth position interpolation
        transform.position = Vector3.Lerp(transform.position, desiredPosition, smoothSpeed * Time.deltaTime);

        // Keep camera focused on player's upper body / head
        Vector3 lookTarget = target.position + Vector3.up * lookAtHeightOffset;
        transform.LookAt(lookTarget);
    }
}
